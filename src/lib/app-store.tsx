import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "./current-user.functions";
import type { Year, Medication } from "./medicare-math";

export type Role = "admin" | "qa" | "agent" | "editor" | "viewer" | "advisor";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  npn_number?: string;
  qa_devices?: string[];
  roles?: string[];
}

export interface Scenario {
  id: string;
  scenario_code: string;
  birth_year: number;
  zip3: string;
  gender: string | null;
  tobacco: boolean;
  income_band: string | null;
  cost_preference: "minimize_monthly" | "predictability";
  medications: Medication[];
  conditions: string[];
  preferences: Record<string, unknown>;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  expires_at: string;
}

export interface SOA {
  id: string;
  scenario_id: string;
  plan_type: string | null;
  status: string;
  signed_at: string;
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

interface Ctx {
  user: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;

  year: Year;
  setYear: (y: Year) => void;

  // Claimed scenarios for this advisor
  scenarios: Scenario[];
  refreshScenarios: () => Promise<void>;
  lookupScenario: (code: string) => Promise<Scenario>;

  soas: SOA[];
  addSOA: (scenarioId: string, planType: string) => Promise<void>;

  credits: number;
  creditTxns: CreditTxn[];
  deductCredit: (description: string) => Promise<boolean>;
  addCredits: (amount: number, description: string) => Promise<void>;

  auditLogs: AuditLog[];
  log: (action: string, details?: Record<string, unknown>) => void;

  activeScenarioCode: string | null;
  setActiveScenarioCode: (code: string | null) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const fetchCurrentUserProfile = useServerFn(getCurrentUserProfile);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [year, setYear] = useState<Year>(2026);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [soas, setSoas] = useState<SOA[]>([]);
  const [credits, setCredits] = useState(0);
  const [creditTxns, setCreditTxns] = useState<CreditTxn[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeScenarioCode, setActiveScenarioCode] = useState<string | null>(null);

  // Auth bootstrap
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setUser(null);
        setScenarios([]); setSoas([]); setCredits(0); setCreditTxns([]); setAuditLogs([]);
        setAuthLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Hydrate profile + role
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      setAuthLoading(true);
      try {
        const profile = await fetchCurrentUserProfile();
        if (cancelled) return;
        setUser(profile as User);
      } catch (err) {
        console.error("Failed to hydrate user profile:", err);
        if (!cancelled) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const { toast } = await import("sonner");
          toast.error("Failed to load user profile: " + errMsg);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [session, fetchCurrentUserProfile]);

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
    supabase.rpc("log_audit_event", {
      p_action: action,
      p_metadata: (details ?? {}) as never,
    }).then(({ error }) => { if (error) console.warn("audit insert failed", error.message); });
  }, [user]);

  const refreshScenarios = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.rpc("my_scenarios");
    if (error) { console.error("my_scenarios", error); return; }
    setScenarios((data ?? []) as unknown as Scenario[]);
  }, [user]);

  // Load advisor data once signed in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [scenariosRes, soasRes, creditsRes, txnRes, logsRes] = await Promise.all([
        supabase.rpc("my_scenarios"),
        supabase.from("soas").select("id, scenario_id, plan_type, status, signed_at").order("signed_at", { ascending: false }),
        supabase.from("advisor_credits").select("balance").eq("advisor_id", user.id).maybeSingle(),
        supabase.from("credit_txns").select("id, advisor_id, amount, description, created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("audit_logs").select("id, action, metadata, created_at").order("created_at", { ascending: false }).limit(100),
      ]);
      if (cancelled) return;
      setScenarios((scenariosRes.data ?? []) as unknown as Scenario[]);
      setSoas((soasRes.data ?? []) as SOA[]);
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
  }, [user]);

  const signOut = async () => {
    log("LOGOUT");
    await supabase.auth.signOut();
  };

  const lookupScenario = async (code: string): Promise<Scenario> => {
    const { data, error } = await supabase.rpc("lookup_scenario", { p_code: code.trim().toUpperCase() });
    if (error) throw new Error(error.message);
    const row = (Array.isArray(data) ? data[0] : data) as unknown as Scenario;
    if (!row) throw new Error("Scenario not found");
    setScenarios((p) => {
      const without = p.filter((s) => s.id !== row.id);
      return [row, ...without];
    });
    log("LOOKUP_SCENARIO", { code: row.scenario_code });
    return row;
  };

  const addSOA: Ctx["addSOA"] = async (scenarioId, planType) => {
    if (!user) return;
    const { data, error } = await supabase.from("soas")
      .insert({ advisor_id: user.id, scenario_id: scenarioId, plan_type: planType, status: "active" })
      .select("id, scenario_id, plan_type, status, signed_at").single();
    if (error || !data) { console.error("addSOA", error); return; }
    setSoas((p) => [data as SOA, ...p]);
    log("SIGN_SOA", { scenario: scenarioId, plan_type: planType });
  };

  const deductCredit: Ctx["deductCredit"] = async (description) => {
    if (!user || credits <= 0) return false;
    const { data, error } = await supabase.rpc("deduct_credit", { p_description: description });
    if (error || data === null) { console.warn("deduct_credit failed", error?.message); return false; }
    setCredits(data as number);
    setCreditTxns((p) => [{ id: crypto.randomUUID(), advisor_id: user.id, amount: -1, description, created_at: new Date().toISOString() }, ...p]);
    return true;
  };

  const addCredits: Ctx["addCredits"] = async (amount, description) => {
    if (!user) return;
    // Positive purchases go through purchase_credits; negative adjustments require admin RPC.
    if (amount > 0) {
      try {
        const { purchaseCreditsServer } = await import("./credits.functions");
        const res = await purchaseCreditsServer({ data: { amount, description } });
        setCredits(res.balance);
      } catch (e) {
        console.warn("purchaseCreditsServer failed", (e as Error)?.message);
        return;
      }
    } else if (amount < 0) {
      const { data, error } = await supabase.rpc("admin_adjust_credits", { p_target: user.id, p_amount: amount, p_description: description });
      if (error || data === null) { console.warn("admin_adjust_credits failed", error?.message); return; }
      setCredits(data as number);
    } else {
      return;
    }
    setCreditTxns((p) => [{ id: crypto.randomUUID(), advisor_id: user.id, amount, description, created_at: new Date().toISOString() }, ...p]);
  };

  return (
    <AppCtx.Provider value={{
      user, authLoading, signOut,
      year, setYear,
      scenarios, refreshScenarios, lookupScenario,
      soas, addSOA,
      credits, creditTxns, deductCredit, addCredits,
      auditLogs, log,
      activeScenarioCode, setActiveScenarioCode,
    }}>{children}</AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
