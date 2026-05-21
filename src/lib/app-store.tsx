import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { deriveKey, encryptJSON, decryptJSON, createVerifier, checkVerifier, newSaltB64 } from "./crypto-phi";
import type { Year, Medication } from "./medicare-math";

export type Role = "client" | "advisor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  npn_number?: string;
  hipaa_acknowledged_at: string | null;
}

export interface Client {
  id: string;
  advisor_id?: string;
  first_name: string;
  last_name: string;
  dob: string;
  zip_code: string;
  county: string;
  monthly_cost_concern: boolean;
  meds: Medication[];
}

export interface SOA {
  id: string;
  client_id: string;
  signed_signature_data: string;
  signature_hash: string;
  signed_at: string;
  ip_address: string;
  status: "pending" | "active" | "archived";
}

export interface AuditLog {
  id: string;
  user_email: string;
  user_role: Role;
  action: string;
  ip_address: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface CreditTxn {
  id: string;
  advisor_id: string;
  amount: number;
  description: string;
  created_at: string;
}

export type LockState = "loading" | "logged-out" | "needs-setup" | "locked" | "unlocked";

interface Ctx {
  user: User | null;
  lockState: LockState;
  setupPassphrase: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  signOut: () => Promise<void>;
  acknowledgeHipaa: () => Promise<void>;

  year: Year;
  setYear: (y: Year) => void;
  clients: Client[];
  addClient: (c: Omit<Client, "id">) => Promise<Client | null>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  soas: SOA[];
  addSOA: (s: Omit<SOA, "id">) => Promise<void>;
  credits: number;
  creditTxns: CreditTxn[];
  deductCredit: (description: string) => Promise<boolean>;
  addCredits: (amount: number, description: string) => Promise<void>;
  auditLogs: AuditLog[];
  log: (action: string, details?: Record<string, unknown>) => void;
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;

  // Legacy compatibility — no-op in real auth flow
  setUser: (u: User | null) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [lockState, setLockState] = useState<LockState>("loading");
  const keyRef = useRef<CryptoKey | null>(null);

  const [year, setYear] = useState<Year>(2026);
  const [clients, setClients] = useState<Client[]>([]);
  const [soas, setSoas] = useState<SOA[]>([]);
  const [credits, setCredits] = useState(0);
  const [creditTxns, setCreditTxns] = useState<CreditTxn[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  // ---- auth bootstrap ----
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        keyRef.current = null;
        setUserState(null);
        setClients([]); setSoas([]); setCredits(0); setCreditTxns([]); setAuditLogs([]);
        setLockState("logged-out");
      }
    });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => subscription.unsubscribe();
  }, []);

  // Hydrate profile + role + check encryption key existence
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const uid = session.user.id;
      const [{ data: profile }, { data: roles }, { data: keyRow }] = await Promise.all([
        supabase.from("profiles").select("full_name, npn_number, hipaa_acknowledged_at").eq("id", uid).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("encryption_keys").select("user_id").eq("user_id", uid).maybeSingle(),
      ]);
      if (cancelled) return;
      const roleList = (roles ?? []).map((r) => r.role as Role);
      const role: Role = roleList.includes("admin") ? "admin" : roleList.includes("advisor") ? "advisor" : "client";
      setUserState({
        id: uid,
        email: session.user.email ?? "",
        full_name: profile?.full_name ?? "",
        npn_number: profile?.npn_number ?? undefined,
        role,
        hipaa_acknowledged_at: profile?.hipaa_acknowledged_at ?? null,
      });
      setLockState(keyRow ? "locked" : "needs-setup");
    })();
    return () => { cancelled = true; };
  }, [session]);

  const log = useCallback((action: string, details?: Record<string, unknown>) => {
    if (!user) return;
    const entry: AuditLog = {
      id: crypto.randomUUID(),
      user_email: user.email,
      user_role: user.role,
      action,
      ip_address: "client",
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((p) => [entry, ...p]);
    // Fire-and-forget server insert (RLS scoped to own user_id)
    supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      metadata: (details ?? {}) as never,
    }).then(({ error }) => { if (error) console.warn("audit insert failed", error.message); });
  }, [user]);

  // Load encrypted data once unlocked
  useEffect(() => {
    if (lockState !== "unlocked" || !user || !keyRef.current) return;
    let cancelled = false;
    const key = keyRef.current;
    (async () => {
      const [clientsRes, soasRes, creditsRes, txnRes, logsRes] = await Promise.all([
        supabase.from("clients_encrypted").select("id, advisor_id, iv, ciphertext, created_at").order("created_at", { ascending: false }),
        supabase.from("soas_encrypted").select("id, client_id, advisor_id, iv, ciphertext, status, signed_at").order("signed_at", { ascending: false }),
        supabase.from("advisor_credits").select("balance").eq("advisor_id", user.id).maybeSingle(),
        supabase.from("credit_txns").select("id, advisor_id, amount, description, created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("audit_logs").select("id, action, metadata, created_at").order("created_at", { ascending: false }).limit(100),
      ]);
      if (cancelled) return;

      const decryptedClients: Client[] = [];
      for (const row of clientsRes.data ?? []) {
        try {
          const body = await decryptJSON<Omit<Client, "id" | "advisor_id">>(key, row.iv, row.ciphertext);
          decryptedClients.push({ id: row.id, advisor_id: row.advisor_id, ...body });
        } catch (e) { console.warn("client decrypt failed", row.id); }
      }
      setClients(decryptedClients);

      const decryptedSoas: SOA[] = [];
      for (const row of soasRes.data ?? []) {
        try {
          const body = await decryptJSON<Omit<SOA, "id" | "client_id" | "status" | "signed_at">>(key, row.iv, row.ciphertext);
          decryptedSoas.push({
            id: row.id,
            client_id: row.client_id,
            status: row.status as SOA["status"],
            signed_at: row.signed_at,
            ...body,
          });
        } catch { /* skip */ }
      }
      setSoas(decryptedSoas);

      setCredits(creditsRes.data?.balance ?? 0);
      setCreditTxns((txnRes.data ?? []) as CreditTxn[]);
      setAuditLogs((logsRes.data ?? []).map((r) => ({
        id: r.id,
        user_email: user.email,
        user_role: user.role,
        action: r.action,
        ip_address: "server",
        details: (r.metadata ?? {}) as Record<string, unknown>,
        timestamp: r.created_at,
      })));
    })();
    return () => { cancelled = true; };
  }, [lockState, user]);

  // ---- passphrase setup / unlock ----
  const setupPassphrase = async (passphrase: string) => {
    if (!user) throw new Error("Not signed in");
    if (passphrase.length < 12) throw new Error("Passphrase must be at least 12 characters");
    const salt = newSaltB64();
    const key = await deriveKey(passphrase, salt);
    const verifier = await createVerifier(key);
    const { error } = await supabase.from("encryption_keys").insert({
      user_id: user.id, salt, verifier_iv: verifier.iv, verifier_ciphertext: verifier.ciphertext,
    });
    if (error) throw new Error(error.message);
    keyRef.current = key;
    setLockState("unlocked");
    log("ENCRYPTION_KEY_INITIALIZED");
  };

  const unlock = async (passphrase: string) => {
    if (!user) return false;
    const { data, error } = await supabase.from("encryption_keys")
      .select("salt, iterations, verifier_iv, verifier_ciphertext").eq("user_id", user.id).maybeSingle();
    if (error || !data) return false;
    const key = await deriveKey(passphrase, data.salt, data.iterations);
    const ok = await checkVerifier(key, data.verifier_iv, data.verifier_ciphertext);
    if (!ok) { log("UNLOCK_FAILED"); return false; }
    keyRef.current = key;
    setLockState("unlocked");
    log("UNLOCK_SUCCESS");
    return true;
  };

  const lock = useCallback(() => {
    keyRef.current = null;
    setClients([]); setSoas([]);
    setLockState((s) => (s === "unlocked" ? "locked" : s));
    log("VAULT_LOCKED");
  }, [log]);

  const signOut = async () => {
    log("LOGOUT");
    keyRef.current = null;
    await supabase.auth.signOut();
  };

  const acknowledgeHipaa = async () => {
    if (!user) return;
    const ts = new Date().toISOString();
    await supabase.from("profiles").update({ hipaa_acknowledged_at: ts }).eq("id", user.id);
    setUserState({ ...user, hipaa_acknowledged_at: ts });
    log("HIPAA_ACKNOWLEDGED");
  };

  // ---- CRUD (encrypted) ----
  const addClient: Ctx["addClient"] = async (c) => {
    if (!user || !keyRef.current) return null;
    const body = { first_name: c.first_name, last_name: c.last_name, dob: c.dob, zip_code: c.zip_code, county: c.county, monthly_cost_concern: c.monthly_cost_concern, meds: c.meds };
    const { iv, ciphertext } = await encryptJSON(keyRef.current, body);
    const { data, error } = await supabase.from("clients_encrypted")
      .insert({ advisor_id: user.id, iv, ciphertext }).select("id, advisor_id").single();
    if (error || !data) { console.error("addClient", error); return null; }
    const created: Client = { id: data.id, advisor_id: data.advisor_id, ...body };
    setClients((p) => [created, ...p]);
    log("CREATE_CLIENT", { client: created.id });
    return created;
  };

  const updateClient: Ctx["updateClient"] = async (id, patch) => {
    if (!user || !keyRef.current) return;
    const existing = clients.find((c) => c.id === id);
    if (!existing) return;
    const merged = { ...existing, ...patch };
    const body = { first_name: merged.first_name, last_name: merged.last_name, dob: merged.dob, zip_code: merged.zip_code, county: merged.county, monthly_cost_concern: merged.monthly_cost_concern, meds: merged.meds };
    const { iv, ciphertext } = await encryptJSON(keyRef.current, body);
    const { error } = await supabase.from("clients_encrypted").update({ iv, ciphertext }).eq("id", id);
    if (error) { console.error("updateClient", error); return; }
    setClients((p) => p.map((c) => (c.id === id ? merged : c)));
    log("EDIT_CLIENT", { client: id });
  };

  const addSOA: Ctx["addSOA"] = async (s) => {
    if (!user || !keyRef.current) return;
    const body = { signed_signature_data: s.signed_signature_data, signature_hash: s.signature_hash, ip_address: s.ip_address };
    const { iv, ciphertext } = await encryptJSON(keyRef.current, body);
    const { data, error } = await supabase.from("soas_encrypted")
      .insert({ advisor_id: user.id, client_id: s.client_id, iv, ciphertext, status: s.status, signed_at: s.signed_at })
      .select("id, signed_at, status").single();
    if (error || !data) { console.error("addSOA", error); return; }
    setSoas((p) => [{ ...s, id: data.id, signed_at: data.signed_at, status: data.status as SOA["status"] }, ...p]);
    log("SIGN_SOA", { client: s.client_id });
  };

  const deductCredit: Ctx["deductCredit"] = async (description) => {
    if (!user || credits <= 0) return false;
    const next = credits - 1;
    const { error: ue } = await supabase.from("advisor_credits").upsert({ advisor_id: user.id, balance: next });
    if (ue) return false;
    await supabase.from("credit_txns").insert({ advisor_id: user.id, amount: -1, description });
    setCredits(next);
    setCreditTxns((p) => [{ id: crypto.randomUUID(), advisor_id: user.id, amount: -1, description, created_at: new Date().toISOString() }, ...p]);
    return true;
  };

  const addCredits: Ctx["addCredits"] = async (amount, description) => {
    if (!user) return;
    const next = credits + amount;
    await supabase.from("advisor_credits").upsert({ advisor_id: user.id, balance: next });
    await supabase.from("credit_txns").insert({ advisor_id: user.id, amount, description });
    setCredits(next);
    setCreditTxns((p) => [{ id: crypto.randomUUID(), advisor_id: user.id, amount, description, created_at: new Date().toISOString() }, ...p]);
  };

  // ---- 15-minute idle auto-lock ----
  useEffect(() => {
    if (lockState !== "unlocked") return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { log("AUTO_LOCK_IDLE"); lock(); }, 15 * 60 * 1000);
    };
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => { clearTimeout(timer); events.forEach((e) => window.removeEventListener(e, reset)); };
  }, [lockState, lock, log]);

  return (
    <AppCtx.Provider value={{
      user, lockState, setupPassphrase, unlock, lock, signOut, acknowledgeHipaa,
      year, setYear,
      clients, addClient, updateClient,
      soas, addSOA,
      credits, creditTxns, deductCredit, addCredits,
      auditLogs, log,
      activeClientId, setActiveClientId,
      setUser: () => { /* deprecated */ },
    }}>{children}</AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// Legacy constants — retained so old imports don't break.
export const ADVISOR_ID = "advisor";
export const ADMIN_ID = "admin";
