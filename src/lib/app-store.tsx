import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "./current-user.functions";
import { clearLocalAuthSession, isForceLoggedOut } from "./auth-session";
import type { Year, Medication } from "./medicare-math";

export type Role = "leads_admin" | "admin" | "qa" | "agent" | "editor" | "viewer" | "advisor" | "customer";

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
  agent_notes?: string | null;
  assigned_agent_id?: string | null;
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

  // Auth bootstrap — validate with the auth server; getSession() alone can restore
  // a stale localStorage token for up to ~1h after admin global sign-out.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setUser(null);
        setScenarios([]);
        setSoas([]);
        setCredits(0);
        setCreditTxns([]);
        setAuditLogs([]);
        setAuthLoading(false);
      }
    });

    (async () => {
      try {
        const {
          data: { session: cached },
        } = await supabase.auth.getSession();
        if (!cached) {
          setAuthLoading(false);
          return;
        }

        const {
          data: { user: authUser },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !authUser || isForceLoggedOut(cached, authUser)) {
          await clearLocalAuthSession((opts) => supabase.auth.signOut(opts));
          setSession(null);
          setUser(null);
          setAuthLoading(false);
          return;
        }

        // Ensure profile hydration runs even if INITIAL_SESSION hasn't fired yet.
        setSession((prev) => prev ?? cached);

        // Refresh in the background — blocking here caused session churn that
        // cancelled profile hydration and left authLoading stuck on /testing.
        void supabase.auth.refreshSession().catch((err) => {
          console.warn("[auth] background refresh failed:", err?.message ?? err);
        });
      } catch {
        setAuthLoading(false);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  // Hydrate profile + role — keyed on user id so token refresh does not re-run.
  const sessionUserId = session?.user?.id;
  const hydrateGenRef = useRef(0);
  useEffect(() => {
    if (!sessionUserId) return;
    if (user?.id === sessionUserId) {
      setAuthLoading(false);
      return;
    }
    const gen = ++hydrateGenRef.current;
    let cancelled = false;
    (async () => {
      setAuthLoading(true);
      try {
        const profile = await fetchCurrentUserProfile();
        if (cancelled || gen !== hydrateGenRef.current) return;
        setUser(profile as User);
      } catch (err) {
        console.error("Failed to hydrate user profile:", err);
        if (!cancelled && gen === hydrateGenRef.current) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const { toast } = await import("sonner");
          toast.error("Failed to load user profile: " + errMsg);

          if (
            errMsg.includes("Unauthorized") ||
            errMsg.includes("Invalid token") ||
            errMsg.includes("invalid claim")
          ) {
            console.warn("Invalid session token detected, clearing session...");
            supabase.auth.signOut().then(() => {
              setUser(null);
              setSession(null);
            });
          }
        }
      } finally {
        if (!cancelled && gen === hydrateGenRef.current) {
          setAuthLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // fetchCurrentUserProfile is stable for the app lifetime; omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sessionUserId is the only trigger
  }, [sessionUserId]);

  const log = useCallback(
    (action: string, details?: Record<string, unknown>) => {
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
      supabase
        .rpc("log_audit_event", {
          p_action: action,
          p_metadata: (details ?? {}) as never,
        })
        .then(({ error }) => {
          if (error) console.warn("audit insert failed", error.message);
        });
    },
    [user],
  );

  const fetchScenarios = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .or(`claimed_by.eq.${user.id},assigned_agent_id.eq.${user.id},created_by.eq.${user.id}`);
    if (error) {
      console.error("fetchScenarios failed:", error);
      return [];
    }
    const rows = (data ?? []) as unknown as Scenario[];
    return rows.sort((a, b) => {
      if (a.claimed_at && b.claimed_at) {
        return new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime();
      }
      if (a.claimed_at) return -1;
      if (b.claimed_at) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [user]);

  const refreshScenarios = useCallback(async () => {
    const list = await fetchScenarios();
    setScenarios(list);
  }, [fetchScenarios]);

  // Load advisor data once signed in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [scenariosList, soasRes, creditsRes, txnRes, logsRes] = await Promise.all([
        fetchScenarios(),
        supabase
          .from("soas")
          .select("id, scenario_id, plan_type, status, signed_at")
          .order("signed_at", { ascending: false }),
        supabase.from("advisor_credits").select("balance").eq("advisor_id", user.id).maybeSingle(),
        supabase
          .from("credit_txns")
          .select("id, advisor_id, amount, description, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("audit_logs")
          .select("id, action, metadata, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (cancelled) return;
      setScenarios(scenariosList);
      setSoas((soasRes.data ?? []) as SOA[]);
      setCredits(creditsRes.data?.balance ?? 0);
      setCreditTxns((txnRes.data ?? []) as CreditTxn[]);
      setAuditLogs(
        (logsRes.data ?? []).map((r) => ({
          id: r.id,
          user_email: user.email,
          user_role: user.role,
          action: r.action,
          ip_address: "server",
          details: (r.metadata ?? {}) as Record<string, unknown>,
          timestamp: r.created_at,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user, fetchScenarios]);

  const signOut = async () => {
    log("LOGOUT");
    await supabase.auth.signOut();
  };

  const lookupScenario = async (code: string): Promise<Scenario> => {
    const normalized = code.trim().toUpperCase();
    const { data, error } = await supabase.rpc("lookup_scenario", { p_code: normalized });
    if (error) throw new Error(error.message);
    const row = (Array.isArray(data) ? data[0] : data) as unknown as Scenario;
    if (!row) throw new Error("Scenario not found");
    setScenarios((p) => {
      const without = p.filter((s) => s.id !== row.id);
      return [row, ...without];
    });
    log("LOOKUP_SCENARIO", { code: row.scenario_code });

    try {
      const { notifyScenarioClaimed } = await import("@/lib/email-triggers.functions");
      await notifyScenarioClaimed({ data: { scenario_code: row.scenario_code } });
    } catch (e) {
      console.warn("scenario-claimed email notification failed", e);
    }

    return row;
  };

  const addSOA: Ctx["addSOA"] = async (scenarioId, planType) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("soas")
      .insert({
        advisor_id: user.id,
        scenario_id: scenarioId,
        plan_type: planType,
        status: "active",
      })
      .select("id, scenario_id, plan_type, status, signed_at")
      .single();
    if (error || !data) {
      console.error("addSOA", error);
      return;
    }
    setSoas((p) => [data as SOA, ...p]);
    log("SIGN_SOA", { scenario: scenarioId, plan_type: planType });
  };

  const deductCredit: Ctx["deductCredit"] = async (description) => {
    if (!user || credits <= 0) return false;
    const { data, error } = await supabase.rpc("deduct_credit", { p_description: description });
    if (error || data === null) {
      console.warn("deduct_credit failed", error?.message);
      return false;
    }
    setCredits(data as number);
    setCreditTxns((p) => [
      {
        id: crypto.randomUUID(),
        advisor_id: user.id,
        amount: -1,
        description,
        created_at: new Date().toISOString(),
      },
      ...p,
    ]);
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
      const { data, error } = await supabase.rpc("admin_adjust_credits", {
        p_target: user.id,
        p_amount: amount,
        p_description: description,
      });
      if (error || data === null) {
        console.warn("admin_adjust_credits failed", error?.message);
        return;
      }
      setCredits(data as number);
    } else {
      return;
    }
    setCreditTxns((p) => [
      {
        id: crypto.randomUUID(),
        advisor_id: user.id,
        amount,
        description,
        created_at: new Date().toISOString(),
      },
      ...p,
    ]);
  };

  return (
    <AppCtx.Provider
      value={{
        user,
        authLoading,
        signOut,
        year,
        setYear,
        scenarios,
        refreshScenarios,
        lookupScenario,
        soas,
        addSOA,
        credits,
        creditTxns,
        deductCredit,
        addCredits,
        auditLogs,
        log,
        activeScenarioCode,
        setActiveScenarioCode,
      }}
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
