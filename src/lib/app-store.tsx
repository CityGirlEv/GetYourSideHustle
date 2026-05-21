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

const seedClients = (): Client[] => [
  {
    id: "c-1",
    advisor_id: ADVISOR_ID,
    first_name: "Eleanor",
    last_name: "Whitfield",
    dob: "1958-03-12",
    zip_code: "77002",
    county: "Harris",
    monthly_cost_concern: true,
    meds: [
      { id: "m1", medication_name: "Lisinopril", strength: "20mg", dosage_form: "Tablet", frequency: "Daily", resolved_diagnosis: "Hypertension", estimated_monthly_retail: 18 },
      { id: "m2", medication_name: "Atorvastatin", strength: "40mg", dosage_form: "Tablet", frequency: "Daily", resolved_diagnosis: "Hyperlipidemia", estimated_monthly_retail: 22 },
    ],
  },
  {
    id: "c-2",
    advisor_id: ADVISOR_ID,
    first_name: "Marcus",
    last_name: "Delaney",
    dob: "1955-11-04",
    zip_code: "90012",
    county: "Los Angeles",
    monthly_cost_concern: false,
    meds: [
      { id: "m3", medication_name: "Novolog", strength: "100 U/mL", dosage_form: "Pen", frequency: "With meals", resolved_diagnosis: "Type 1 Diabetes (Insulin)", estimated_monthly_retail: 320 },
      { id: "m4", medication_name: "Dexcom G7", strength: "n/a", dosage_form: "CGM DME", frequency: "Continuous", resolved_diagnosis: "Type 1 Diabetes (CGM DME)", estimated_monthly_retail: 410 },
    ],
  },
  {
    id: "c-3",
    advisor_id: ADVISOR_ID,
    first_name: "Priya",
    last_name: "Singh",
    dob: "1960-07-22",
    zip_code: "33130",
    county: "Miami-Dade",
    monthly_cost_concern: true,
    meds: [
      { id: "m5", medication_name: "Albuterol", strength: "90mcg", dosage_form: "Inhaler", frequency: "As needed", resolved_diagnosis: "COPD / Asthma", estimated_monthly_retail: 65 },
    ],
  },
];

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
  const [soas, setSoas] = useState<SOA[]>([
    { id: "s-1", client_id: "c-1", signed_signature_data: "Eleanor Whitfield", signature_hash: "a3f9c1", signed_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), ip_address: "192.168.1.21", status: "active" },
  ]);
  const [credits, setCredits] = useState(12);
  const [creditTxns, setCreditTxns] = useState<CreditTxn[]>([
    { id: "t-1", advisor_id: ADVISOR_ID, amount: 10, description: "Initial allocation", created_at: new Date().toISOString() },
    { id: "t-2", advisor_id: ADVISOR_ID, amount: 2, description: "Bonus credits", created_at: new Date().toISOString() },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "a-1", user_email: "advisor@demo.health", user_role: "advisor", action: "VIEW_CLIENT_PHI", ip_address: "192.168.1.21", details: { client: "c-1" }, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: "a-2", user_email: "advisor@demo.health", user_role: "advisor", action: "SIGN_SOA", ip_address: "192.168.1.21", details: { client: "c-1" }, timestamp: new Date(Date.now() - 70000000).toISOString() },
  ]);
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
