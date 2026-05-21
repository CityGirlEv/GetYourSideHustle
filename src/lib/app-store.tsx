import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Year } from "./medicare-math";
import type { Medication } from "./medicare-math";

export type Role = "client" | "advisor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  npn_number?: string;
}

export interface Client {
  id: string;
  user_id?: string;
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

const ADVISOR_ID = "advisor-1";
const ADMIN_ID = "admin-1";

const seedClients = (): Client[] => [];

interface Ctx {
  user: User | null;
  setUser: (u: User | null) => void;
  year: Year;
  setYear: (y: Year) => void;
  clients: Client[];
  addClient: (c: Omit<Client, "id">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  soas: SOA[];
  addSOA: (s: Omit<SOA, "id">) => void;
  credits: number;
  creditTxns: CreditTxn[];
  deductCredit: (description: string) => boolean;
  addCredits: (amount: number, description: string) => void;
  auditLogs: AuditLog[];
  log: (action: string, details?: Record<string, unknown>) => void;
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [year, setYear] = useState<Year>(2026);
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [soas, setSoas] = useState<SOA[]>([]);
  const [credits, setCredits] = useState(0);
  const [creditTxns, setCreditTxns] = useState<CreditTxn[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  const log = useCallback((action: string, details?: Record<string, unknown>) => {
    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        user_email: user?.email ?? "anonymous",
        user_role: user?.role ?? "client",
        action,
        ip_address: "10.0.0." + Math.floor(Math.random() * 250),
        details,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [user]);

  const addClient: Ctx["addClient"] = (c) => {
    const created: Client = { ...c, id: crypto.randomUUID() };
    setClients((p) => [created, ...p]);
    log("CREATE_CLIENT", { client: created.id });
    return created;
  };
  const updateClient: Ctx["updateClient"] = (id, patch) => {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    log("EDIT_CLIENT", { client: id });
  };
  const addSOA: Ctx["addSOA"] = (s) => {
    setSoas((p) => [{ ...s, id: crypto.randomUUID() }, ...p]);
    log("SIGN_SOA", { client: s.client_id });
  };
  const deductCredit: Ctx["deductCredit"] = (description) => {
    if (credits <= 0) return false;
    setCredits((c) => c - 1);
    setCreditTxns((p) => [{ id: crypto.randomUUID(), advisor_id: ADVISOR_ID, amount: -1, description, created_at: new Date().toISOString() }, ...p]);
    return true;
  };
  const addCredits: Ctx["addCredits"] = (amount, description) => {
    setCredits((c) => c + amount);
    setCreditTxns((p) => [{ id: crypto.randomUUID(), advisor_id: ADVISOR_ID, amount, description, created_at: new Date().toISOString() }, ...p]);
  };

  // Idle timeout 15 minutes
  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        log("AUTO_LOGOUT_IDLE");
        setUser(null);
        window.location.href = "/";
      }, 15 * 60 * 1000);
    };
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, log]);

  return (
    <AppCtx.Provider
      value={{ user, setUser, year, setYear, clients, addClient, updateClient, soas, addSOA, credits, creditTxns, deductCredit, addCredits, auditLogs, log, activeClientId, setActiveClientId }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { ADVISOR_ID, ADMIN_ID };
