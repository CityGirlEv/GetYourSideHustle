import React, { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Sparkles,
  FlaskConical,
  Users,
  ListChecks,
  Megaphone,
  CalendarRange,
  CalendarDays,
  ClipboardList,
  Map,
  BookOpen,
  Clock,
  Award,
  Mail,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { ROOT_DOMAIN } from "../lib/site-config";
import { TestingPortal } from "./admin/TestingPortal";
import { QaTestingManualPage } from "./admin/QaTestingManualPage";
import { UsersArea } from "./admin/UsersArea";
import { ContentFactory } from "./admin/ContentFactory";
import { TaskList } from "./admin/TaskList";
import { Financials } from "./admin/Financials";
import { SchedulePage } from "./admin/SchedulePage";
import { AgendaPage } from "./admin/AgendaPage";
import { DueTasksModal } from "./admin/DueTasksModal";
import { SprintCelebration } from "./admin/SprintCelebration";
import { SiteMapPage } from "./admin/SiteMapPage";
import type { SiteMapHref } from "../lib/site-map";
import { TimesheetPage } from "./admin/TimesheetPage";
import { UserGuidesHub } from "./admin/UserGuidesHub";
import { CertificatesAdmin } from "./admin/CertificatesAdmin";
import { EmailTemplates } from "./admin/EmailTemplates";
import { DailyProgressPage } from "./admin/DailyProgressPage";
import { MembershipsPage } from "./admin/MembershipsPage";
import { AdminHustleSchedulesPage } from "./admin/AdminHustleSchedulesPage";
import type { AuthUser } from "../lib/auth";
import { canAccessAdminPortal } from "../lib/gysh-roles";
import {
  assigneeForAuthUser,
  dueAttentionTasks,
  fetchTasks,
  type GyshTask,
} from "../lib/gysh-tasks";
import { dueAttentionTests, type AttentionTest } from "../lib/gysh-due-attention";
import {
  attentionClearForPartner,
  sprintWorkClearForPartner,
  type SprintClearResult,
} from "../lib/gysh-sprint-complete";
import { fetchTestStatuses } from "../lib/gysh-test-plan";
import {
  ADMIN_MENU_GROUPS,
  ADMIN_TABS,
  ADMIN_USER_GUIDE_LINKS,
  adminTabById,
  type AdminTab,
  type AdminTabDef,
  type UserGuideId,
} from "../lib/admin-nav";
import {
  ADMIN_DEEPLINK_EVENT,
  clearAdminFocusFromUrl,
  readAdminDeepLink,
} from "../lib/admin-deep-links";
import {
  fetchPartnerAgenda,
  mustPickAgendaTimes,
} from "../lib/gysh-partner-agenda";

export type { AdminTab, AdminTabDef, UserGuideId };
export { ADMIN_MENU_GROUPS, ADMIN_TABS, ADMIN_USER_GUIDE_LINKS, adminTabById };

function userIsAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  const roles = user.roles?.length ? user.roles : [user.role];
  return roles.includes("admin");
}

const LOGIN_POPUP_FLAG = "gysh_due_popup_login";
const DAILY_POPUP_PREFIX = "gysh_due_popup_day_";
const CELEB_DAY_PREFIX = "gysh_sprint_celeb_day_";
const CELEB_DONE_PREFIX = "gysh_sprint_celeb_done_";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  authUser?: AuthUser | null;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  userGuide?: UserGuideId;
  onUserGuideChange?: (guide: UserGuideId) => void;
  onSiteMapNavigate?: (href: SiteMapHref) => void;
  /** Notify App so site-wide nav can lock until Tina/Lyriq submit meeting times. */
  onMeetingGateChange?: (locked: boolean) => void;
};

export const AdminPortal: React.FC<Props> = ({
  authUser = null,
  activeTab,
  onTabChange,
  userGuide = "member",
  onUserGuideChange,
  onSiteMapNavigate,
  onMeetingGateChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "monetize" | "growth">("calendar");
  const [localGuide, setLocalGuide] = useState<UserGuideId>(userGuide);
  const [dueModalOpen, setDueModalOpen] = useState(false);
  const [celebOpen, setCelebOpen] = useState(false);
  const [celebClear, setCelebClear] = useState<SprintClearResult | null>(null);
  const [overdue, setOverdue] = useState<GyshTask[]>([]);
  const [dueToday, setDueToday] = useState<GyshTask[]>([]);
  const [overdueTests, setOverdueTests] = useState<AttentionTest[]>([]);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [focusTestId, setFocusTestId] = useState<string | null>(null);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [focusEmailTemplate, setFocusEmailTemplate] = useState<string | null>(null);
  const [showQaManual, setShowQaManual] = useState(false);
  const [agendaGateActive, setAgendaGateActive] = useState(false);
  const isAdmin = userIsAdmin(authUser);
  const activeGuide = onUserGuideChange ? userGuide : localGuide;
  const setActiveGuide = onUserGuideChange ?? setLocalGuide;

  useEffect(() => {
    if (onUserGuideChange) setLocalGuide(userGuide);
  }, [userGuide, onUserGuideChange]);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "schedule", label: "Schedule & Plan", icon: <CalendarRange size={16} /> },
    { id: "agenda", label: "Agenda", icon: <ClipboardList size={16} /> },
    { id: "tasks", label: "Task List", icon: <ListChecks size={16} /> },
    { id: "testing", label: "Testing Portal", icon: <FlaskConical size={16} /> },
    { id: "timesheet", label: "Timesheet", icon: <Clock size={16} /> },
    { id: "daily-progress", label: "Daily Progress", icon: <FileText size={16} /> },
    { id: "users", label: "Users Area", icon: <Users size={16} /> },
    { id: "memberships", label: "Memberships", icon: <BadgeCheck size={16} /> },
    { id: "hustle-schedules", label: "Schedule Suites", icon: <CalendarDays size={16} /> },
    { id: "certificates", label: "Certificates", icon: <Award size={16} /> },
    { id: "email", label: "Email Templates", icon: <Mail size={16} /> },
    ...(isAdmin
      ? [
          { id: "factory" as const, label: "Content Factory", icon: <Sparkles size={16} /> },
          { id: "financials" as const, label: "Financials", icon: <DollarSign size={16} /> },
        ]
      : []),
    { id: "studio", label: "Growth Studio", icon: <Megaphone size={16} /> },
    { id: "sitemap", label: "Site Map", icon: <Map size={16} /> },
    { id: "user-guides", label: "User Guides", icon: <BookOpen size={16} /> },
  ];

  const setGate = (locked: boolean) => {
    setAgendaGateActive(locked);
    onMeetingGateChange?.(locked);
  };

  useEffect(() => {
    if (!mustPickAgendaTimes(authUser)) {
      setGate(false);
      return;
    }
    let cancelled = false;
    void fetchPartnerAgenda()
      .then((payload) => {
        if (cancelled) return;
        const locked = Boolean(payload.needsTimePicks);
        setGate(locked);
        if (locked && activeTab !== "agenda") {
          onTabChange("agenda");
        }
      })
      .catch(() => {
        // Fail closed for Tina/Lyriq — keep them on Agenda until API works.
        if (!cancelled) {
          setGate(true);
          if (activeTab !== "agenda") onTabChange("agenda");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gate check on auth / tab
  }, [authUser, activeTab, onTabChange]);

  useEffect(() => {
    if (agendaGateActive && activeTab !== "agenda") {
      onTabChange("agenda");
    }
  }, [agendaGateActive, activeTab, onTabChange]);

  const requestTabChange = (tab: AdminTab) => {
    if (agendaGateActive && tab !== "agenda") return;
    onTabChange(tab);
  };

  useEffect(() => {
    if ((activeTab === "financials" || activeTab === "factory") && !isAdmin) {
      requestTabChange("tasks");
    }
    if (activeTab !== "testing") setShowQaManual(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin]);

  // Deep link: /admin?tab=testing&test=… / tasks&task=… / factory&item=…
  // Re-apply on mount, browser history, and SPA navigateAdminDeepLink / markdown clicks.
  useEffect(() => {
    const applyDeepLink = (ev?: Event) => {
      const detail =
        ev && "detail" in ev && ev.detail && typeof ev.detail === "object"
          ? (ev.detail as ReturnType<typeof readAdminDeepLink>)
          : null;
      const link =
        detail &&
        (detail.tab || detail.testId || detail.taskId || detail.itemId || detail.template)
          ? detail
          : readAdminDeepLink();
      if (link.tab) {
        if ((link.tab === "factory" || link.tab === "financials") && !userIsAdmin(authUser)) {
          onTabChange("tasks");
        } else {
          onTabChange(link.tab);
        }
      }
      if (link.testId) {
        setShowQaManual(false);
        setFocusTestId(link.testId);
      }
      if (link.taskId) setFocusTaskId(link.taskId);
      if (link.itemId) setFocusItemId(link.itemId);
      if (link.template) setFocusEmailTemplate(link.template);
      if (link.testId || link.taskId || link.itemId) clearAdminFocusFromUrl();
    };
    applyDeepLink();
    window.addEventListener("popstate", applyDeepLink);
    window.addEventListener(ADMIN_DEEPLINK_EVENT, applyDeepLink);
    return () => {
      window.removeEventListener("popstate", applyDeepLink);
      window.removeEventListener(ADMIN_DEEPLINK_EVENT, applyDeepLink);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- authUser for gate; listeners own re-apply
  }, [authUser]);

  useEffect(() => {
    let cancelled = false;
    const me = assigneeForAuthUser(authUser);
    if (!me) return;

    const forceFromLogin = sessionStorage.getItem(LOGIN_POPUP_FLAG) === "1";
    const dayKey = `${DAILY_POPUP_PREFIX}${authUser?.id || me}`;
    const alreadyToday = localStorage.getItem(dayKey) === todayKey();

    (async () => {
      try {
        // Due popup only needs current tasks/tests — avoid heavy CF seed sync here.
        const [tasks, testStatuses] = await Promise.all([
          fetchTasks(),
          fetchTestStatuses(),
        ]);
        if (cancelled) return;
        const attention = dueAttentionTasks(tasks, me);
        const testAttention = dueAttentionTests(testStatuses, me);
        const hasTaskItems = attention.overdue.length > 0 || attention.dueToday.length > 0;
        const hasOverdueTests = testAttention.overdue.length > 0;
        const hasItems = hasTaskItems || hasOverdueTests;
        const sprintClear = sprintWorkClearForPartner(tasks, testStatuses, me);
        const noAttention = attentionClearForPartner(tasks, testStatuses, me);

        const openModal = () => {
          setOverdue(attention.overdue);
          setDueToday(attention.dueToday);
          setOverdueTests(testAttention.overdue);
          setDueModalOpen(true);
          localStorage.setItem(dayKey, todayKey());
        };

        const celebDayKey = `${CELEB_DAY_PREFIX}${authUser?.id || me}_${sprintClear.sprintIndex}`;
        const celebDoneKey = `${CELEB_DONE_PREFIX}${authUser?.id || me}_${sprintClear.sprintIndex}`;
        const celebShownToday = localStorage.getItem(celebDayKey) === todayKey();
        const wasAlreadyComplete = localStorage.getItem(celebDoneKey) === "1";
        const newlyCompleted = sprintClear.allClear && !wasAlreadyComplete;

        const openCelebration = () => {
          setCelebClear(sprintClear);
          setCelebOpen(true);
          localStorage.setItem(celebDayKey, todayKey());
          localStorage.setItem(celebDoneKey, "1");
        };

        if (!sprintClear.allClear) {
          localStorage.removeItem(celebDoneKey);
        }

        // Meeting-date gate first — no other modals until Tina/Lyriq submit times.
        if (mustPickAgendaTimes(authUser)) {
          try {
            const agenda = await fetchPartnerAgenda();
            if (cancelled) return;
            if (agenda.needsTimePicks) {
              if (forceFromLogin) sessionStorage.removeItem(LOGIN_POPUP_FLAG);
              return;
            }
          } catch {
            if (forceFromLogin) sessionStorage.removeItem(LOGIN_POPUP_FLAG);
            return;
          }
        }

        // Fresh login: due/overdue first; else celebrate a clear sprint board.
        if (forceFromLogin) {
          sessionStorage.removeItem(LOGIN_POPUP_FLAG);
          if (hasItems) openModal();
          else if (sprintClear.allClear && noAttention && (newlyCompleted || !celebShownToday)) {
            openCelebration();
          }
          return;
        }

        // Once per day when opening Admin if overdue tasks or tests remain
        if (!alreadyToday && (attention.overdue.length > 0 || hasOverdueTests)) {
          openModal();
          return;
        }

        // Once per day (or when newly completed) when Admin opens and sprint work is clear
        if (sprintClear.allClear && noAttention && (newlyCompleted || !celebShownToday)) {
          openCelebration();
        }
      } catch {
        if (forceFromLogin) sessionStorage.removeItem(LOGIN_POPUP_FLAG);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  const assigneeLabel = assigneeForAuthUser(authUser) ?? "you";

  // Defense in depth: never render Schedule / partner tools without portal roles.
  if (!canAccessAdminPortal(authUser)) {
    return (
      <div className="glass" style={{ padding: 28, borderRadius: 14, color: "var(--text-primary)" }}>
        <h2 style={{ fontSize: "1.4rem", color: "var(--bronze)", marginBottom: 8 }}>
          Admin sign-in required
        </h2>
        <p style={{ margin: 0 }}>
          Schedule &amp; Plan and other Admin Studio tools are only available to signed-in Admin, QA,
          or Dev accounts.
        </p>
      </div>
    );
  }

  return (
    <div>
      <DueTasksModal
        open={dueModalOpen}
        assigneeLabel={assigneeLabel}
        overdue={overdue}
        dueToday={dueToday}
        overdueTests={overdueTests}
        onClose={() => setDueModalOpen(false)}
        onOpenTaskList={() => requestTabChange("tasks")}
        onOpenTesting={() => requestTabChange("testing")}
      />
      {celebClear ? (
        <SprintCelebration
          open={celebOpen}
          assigneeLabel={assigneeLabel}
          clear={celebClear}
          onClose={() => setCelebOpen(false)}
        />
      ) : null}

      <div
        className="admin-portal-nav"
        aria-label="Admin sections"
        aria-disabled={agendaGateActive || undefined}
        style={agendaGateActive ? { opacity: 0.45, pointerEvents: "none" } : undefined}
      >
        {ADMIN_MENU_GROUPS.map((group) => {
          const groupTabs = group.tabs
            .map((id) => tabs.find((t) => t.id === id))
            .filter((t): t is (typeof tabs)[number] => Boolean(t));
          if (groupTabs.length === 0) return null;
          return (
            <div
              key={group.id}
              className={`admin-portal-nav__group${group.id === "delivery" ? " admin-portal-nav__group--delivery" : ""}`}
            >
              <p className="admin-portal-nav__label">{group.label}</p>
              <div className="admin-portal-nav__tabs">
                {groupTabs.map((t) =>
                  t.id === "testing" ? (
                    <span
                      key={t.id}
                      className={`nav-link-btn admin-portal-nav__testing-bubble ${activeTab === t.id ? "active" : ""}`}
                    >
                      <button
                        type="button"
                        className="admin-portal-nav__testing-main"
                        disabled={agendaGateActive}
                        onClick={() => requestTabChange(t.id)}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                      <button
                        type="button"
                        className="admin-portal-nav__manual-link"
                        title="Open the QA testing manual"
                        aria-pressed={showQaManual}
                        disabled={agendaGateActive}
                        onClick={() => {
                          requestTabChange("testing");
                          setShowQaManual(true);
                        }}
                      >
                        <BookOpen size={13} aria-hidden />
                        Manual
                      </button>
                    </span>
                  ) : (
                    <button
                      key={t.id}
                      type="button"
                      disabled={agendaGateActive && t.id !== "agenda"}
                      onClick={() => requestTabChange(t.id)}
                      className={`nav-link-btn ${activeTab === t.id ? "active" : ""}`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>

      {agendaGateActive && (
        <div
          className="glass"
          data-testid="agenda-meeting-gate-banner"
          style={{
            marginBottom: 12,
            padding: "14px 16px",
            borderRadius: 10,
            border: "1px solid rgba(155,47,40,0.35)",
            background: "rgba(155,47,40,0.1)",
            color: "var(--charcoal)",
            fontSize: "1rem",
          }}
        >
          <strong style={{ color: "#9B2F28" }}>It&apos;s time we meet.</strong>{" "}
          I need you to give me at least 3 suggested meeting dates below before anything else in
          the app unlocks. Navigation is locked until those dates are saved.
        </div>
      )}

      {activeTab === "testing" &&
        (showQaManual ? (
          <QaTestingManualPage onBack={() => setShowQaManual(false)} />
        ) : (
          <TestingPortal
            focusTestId={focusTestId}
            onFocusConsumed={() => setFocusTestId(null)}
            authUser={authUser}
            onOpenManual={() => setShowQaManual(true)}
          />
        ))}
      {activeTab === "schedule" && (
        <SchedulePage
          authUser={authUser}
          onOpenTask={(id) => {
            setFocusTaskId(id);
            requestTabChange("tasks");
          }}
          onOpenTest={(id) => {
            setShowQaManual(false);
            setFocusTestId(id);
            requestTabChange("testing");
          }}
          onOpenAgenda={() => requestTabChange("agenda")}
        />
      )}
      {activeTab === "agenda" && (
        <AgendaPage
          authUser={authUser}
          forceTimePicks={agendaGateActive}
          onTimePicksSatisfied={() => setGate(false)}
          onOpenTask={(id) => {
            setFocusTaskId(id);
            requestTabChange("tasks");
          }}
          onOpenTest={(id) => {
            setShowQaManual(false);
            setFocusTestId(id);
            requestTabChange("testing");
          }}
        />
      )}
      {activeTab === "users" && <UsersArea currentUserId={authUser?.id ?? null} />}
      {activeTab === "memberships" && <MembershipsPage />}
      {activeTab === "hustle-schedules" && <AdminHustleSchedulesPage />}
      {activeTab === "certificates" && <CertificatesAdmin />}
      {activeTab === "email" && <EmailTemplates focusSlug={focusEmailTemplate} />}
      {activeTab === "factory" && isAdmin && (
        <ContentFactory
          focusItemId={focusItemId}
          onFocusConsumed={() => setFocusItemId(null)}
        />
      )}
      {activeTab === "tasks" && (
        <TaskList
          focusTaskId={focusTaskId}
          onFocusConsumed={() => setFocusTaskId(null)}
          authUser={authUser}
        />
      )}
      {activeTab === "timesheet" && <TimesheetPage authUser={authUser} />}
      {activeTab === "daily-progress" && <DailyProgressPage />}
      {activeTab === "financials" && isAdmin && <Financials />}
      {activeTab === "sitemap" && <SiteMapPage onNavigate={onSiteMapNavigate} />}
      {activeTab === "user-guides" && (
        <UserGuidesHub activeGuide={activeGuide} onGuideChange={setActiveGuide} />
      )}

      {activeTab === "studio" && (
        <>
          <div className="glass" style={{ padding: "28px", borderRadius: "16px", marginBottom: "28px", background: "linear-gradient(135deg, #ffffff, rgba(215, 198, 151, 0.55))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: "1.6rem", color: "var(--bronze)", marginBottom: "6px" }}>GYSH Growth Studio</h2>
                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  Planning notes for {ROOT_DOMAIN}. Publishing calendar will connect to Content Factory / DB later — no placeholder posts shown as live data.
                </p>
              </div>
              <span className="glow-badge emerald">Logged In: GYSH Admin</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => setActiveSubTab("calendar")} className={`nav-link-btn ${activeSubTab === "calendar" ? "active" : ""}`}>
              <Calendar size={16} /> Content Calendar
            </button>
            <button type="button" onClick={() => setActiveSubTab("monetize")} className={`nav-link-btn ${activeSubTab === "monetize" ? "active" : ""}`}>
              <DollarSign size={16} /> Monetization
            </button>
            <button type="button" onClick={() => setActiveSubTab("growth")} className={`nav-link-btn ${activeSubTab === "growth" ? "active" : ""}`}>
              <TrendingUp size={16} /> Growth Guide
            </button>
          </div>

          {activeSubTab === "calendar" && (
            <div className="glass" style={{ padding: 28, borderRadius: 14, color: "var(--text-primary)" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: 8 }}>Publishing schedule</h3>
              <p style={{ margin: "0 0 16px" }}>
                The overall schedule and implementation plan have their own workspace with a Tuesday–Monday sprint cadence.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => onTabChange("schedule")}>
                Open Schedule &amp; Plan
              </button>
            </div>
          )}

          {activeSubTab === "monetize" && (
            <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <DollarSign size={20} style={{ color: "var(--bronze)" }} /> Monetization ideas (planning notes)
              </h3>
              <p style={{ fontSize: "1rem", color: "var(--text-primary)", marginBottom: 16 }}>
                These are strategy notes only — not live products or revenue data.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  ["E-Commerce Affiliate Integrations", "Promote tools you already teach — Printify, Shopify apps, STR software."],
                  ["Premium Community Circles ($19–$49/mo)", "Adult hustle circle + parent/junior circle with weekly live Q&A."],
                  ["Digital Launch Kit Bundles", "Guides, prompt packs, and agent starters as one-time offers."],
                  ["Paid Mentor Listings", "Featured mentors from graduates of each Training Circle."],
                  ["Training Circle Tuition", "Cohorts for Agents, Meta+Shopify, Websites, and Dropshipping."],
                ].map(([title, body], i) => (
                  <div key={title} style={{ display: "flex", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(215, 198, 151, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bronze)", flexShrink: 0 }}>
                      <strong>{i + 1}</strong>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "4px" }}>{title}</h4>
                      <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.5" }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "growth" && (
            <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} style={{ color: "var(--bronze)" }} /> Growth guide (planning notes)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {[
                  ["Pin Kevina on every YT upload", `Link Kids Corner on ${ROOT_DOMAIN} in the first comment.`],
                  ["Cross-post FB + YouTube lives", "Rate subscriber side-hustle ideas live once a week."],
                  ["Training Circle waitlists", "One CTA per circle — Agents, Websites, Meta+Shopify, POD."],
                  ["Dual-audience newsletter", "Kids glow story + adult calculator tip every Friday."],
                ].map(([title, body]) => (
                  <div key={title} style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "#fff" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "8px" }}>{title}</h4>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.5" }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
