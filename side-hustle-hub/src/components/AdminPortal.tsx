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
  Map,
  BookOpen,
  Clock,
  Award,
  Mail,
} from "lucide-react";
import { ROOT_DOMAIN } from "../lib/site-config";
import { TestingPortal } from "./admin/TestingPortal";
import { UsersArea } from "./admin/UsersArea";
import { ContentFactory } from "./admin/ContentFactory";
import { TaskList } from "./admin/TaskList";
import { Financials } from "./admin/Financials";
import { SchedulePage } from "./admin/SchedulePage";
import { DueTasksModal } from "./admin/DueTasksModal";
import { SiteMapPage } from "./admin/SiteMapPage";
import { TimesheetPage } from "./admin/TimesheetPage";
import { UserGuidesHub, type UserGuideId } from "./admin/UserGuidesHub";
import { CertificatesAdmin } from "./admin/CertificatesAdmin";
import { EmailTemplates } from "./admin/EmailTemplates";
import type { AuthUser } from "../lib/auth";
import {
  assigneeForAuthUser,
  dueAttentionTasks,
  syncGuideReviewTasks,
  type GyshTask,
} from "../lib/gysh-tasks";

export type AdminTab =
  | "studio"
  | "schedule"
  | "testing"
  | "users"
  | "factory"
  | "tasks"
  | "timesheet"
  | "financials"
  | "sitemap"
  | "user-guides"
  | "certificates"
  | "email";

export type AdminTabDef = { id: AdminTab; label: string; adminOnly?: boolean };

export const ADMIN_TABS: AdminTabDef[] = [
  { id: "schedule", label: "Schedule & Plan" },
  { id: "tasks", label: "Task List" },
  { id: "testing", label: "Testing Portal" },
  { id: "timesheet", label: "Timesheet" },
  { id: "users", label: "Users Area" },
  { id: "certificates", label: "Certificates" },
  { id: "email", label: "Email Templates" },
  { id: "factory", label: "Content Factory" },
  { id: "financials", label: "Financials", adminOnly: true },
  { id: "studio", label: "Growth Studio" },
  { id: "sitemap", label: "Site Map" },
  { id: "user-guides", label: "User Guides" },
];

/** Grouped Admin header menu — keeps the long list scannable. */
export const ADMIN_MENU_GROUPS: { id: string; label: string; tabs: AdminTab[] }[] = [
  { id: "delivery", label: "Plan & delivery", tabs: ["schedule", "tasks", "timesheet", "testing"] },
  { id: "people", label: "People & access", tabs: ["users", "certificates", "email"] },
  { id: "content", label: "Content & growth", tabs: ["factory", "studio", "financials"] },
  { id: "reference", label: "Reference", tabs: ["sitemap", "user-guides"] },
];

export const ADMIN_USER_GUIDE_LINKS: { id: UserGuideId; label: string }[] = [
  { id: "master", label: "Complete Guide" },
  { id: "adult", label: "Adult Manual" },
  { id: "kids", label: "Kids Manual" },
  { id: "teens", label: "Teens Manual" },
  { id: "seniors", label: "Seniors Manual" },
  { id: "member", label: "Member Tour" },
  { id: "admin", label: "Admin User Guide" },
];

export function adminTabById(id: AdminTab): AdminTabDef | undefined {
  return ADMIN_TABS.find((t) => t.id === id);
}

function userIsAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  const roles = user.roles?.length ? user.roles : [user.role];
  return roles.includes("admin");
}

const LOGIN_POPUP_FLAG = "gysh_due_popup_login";
const DAILY_POPUP_PREFIX = "gysh_due_popup_day_";

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
};

export const AdminPortal: React.FC<Props> = ({
  authUser = null,
  activeTab,
  onTabChange,
  userGuide = "member",
  onUserGuideChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "monetize" | "growth">("calendar");
  const [localGuide, setLocalGuide] = useState<UserGuideId>(userGuide);
  const [dueModalOpen, setDueModalOpen] = useState(false);
  const [overdue, setOverdue] = useState<GyshTask[]>([]);
  const [dueToday, setDueToday] = useState<GyshTask[]>([]);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [focusTestId, setFocusTestId] = useState<string | null>(null);
  const isAdmin = userIsAdmin(authUser);
  const activeGuide = onUserGuideChange ? userGuide : localGuide;
  const setActiveGuide = onUserGuideChange ?? setLocalGuide;

  useEffect(() => {
    if (onUserGuideChange) setLocalGuide(userGuide);
  }, [userGuide, onUserGuideChange]);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "schedule", label: "Schedule & Plan", icon: <CalendarRange size={16} /> },
    { id: "tasks", label: "Task List", icon: <ListChecks size={16} /> },
    { id: "testing", label: "Testing Portal", icon: <FlaskConical size={16} /> },
    { id: "timesheet", label: "Timesheet", icon: <Clock size={16} /> },
    { id: "users", label: "Users Area", icon: <Users size={16} /> },
    { id: "certificates", label: "Certificates", icon: <Award size={16} /> },
    { id: "email", label: "Email Templates", icon: <Mail size={16} /> },
    { id: "factory", label: "Content Factory", icon: <Sparkles size={16} /> },
    ...(isAdmin
      ? [{ id: "financials" as const, label: "Financials", icon: <DollarSign size={16} /> }]
      : []),
    { id: "studio", label: "Growth Studio", icon: <Megaphone size={16} /> },
    { id: "sitemap", label: "Site Map", icon: <Map size={16} /> },
    { id: "user-guides", label: "User Guides", icon: <BookOpen size={16} /> },
  ];

  useEffect(() => {
    if (activeTab === "financials" && !isAdmin) onTabChange("tasks");
  }, [activeTab, isAdmin, onTabChange]);

  useEffect(() => {
    let cancelled = false;
    const me = assigneeForAuthUser(authUser);
    if (!me) return;

    const forceFromLogin = sessionStorage.getItem(LOGIN_POPUP_FLAG) === "1";
    const dayKey = `${DAILY_POPUP_PREFIX}${authUser?.id || me}`;
    const alreadyToday = localStorage.getItem(dayKey) === todayKey();

    (async () => {
      try {
        // Keep Task List in sync: one review item per launch guide (D1).
        const { tasks } = await syncGuideReviewTasks();
        if (cancelled) return;
        const attention = dueAttentionTasks(tasks, me);
        const hasItems = attention.overdue.length > 0 || attention.dueToday.length > 0;

        // Fresh login: show modal when there are due-today or overdue items.
        if (forceFromLogin) {
          sessionStorage.removeItem(LOGIN_POPUP_FLAG);
          if (hasItems) {
            setOverdue(attention.overdue);
            setDueToday(attention.dueToday);
            setDueModalOpen(true);
            localStorage.setItem(dayKey, todayKey());
          }
          return;
        }

        // Optional: once per day when opening Admin if overdue exists
        if (!alreadyToday && attention.overdue.length > 0) {
          setOverdue(attention.overdue);
          setDueToday(attention.dueToday);
          setDueModalOpen(true);
          localStorage.setItem(dayKey, todayKey());
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

  return (
    <div>
      <DueTasksModal
        open={dueModalOpen}
        assigneeLabel={assigneeLabel}
        overdue={overdue}
        dueToday={dueToday}
        onClose={() => setDueModalOpen(false)}
        onOpenTaskList={() => onTabChange("tasks")}
      />

      <div className="admin-portal-nav" aria-label="Admin sections">
        {ADMIN_MENU_GROUPS.map((group) => {
          const groupTabs = group.tabs
            .map((id) => tabs.find((t) => t.id === id))
            .filter((t): t is (typeof tabs)[number] => Boolean(t));
          if (groupTabs.length === 0) return null;
          return (
            <div key={group.id} className="admin-portal-nav__group">
              <p className="admin-portal-nav__label">{group.label}</p>
              <div className="admin-portal-nav__tabs">
                {groupTabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTabChange(t.id)}
                    className={`nav-link-btn ${activeTab === t.id ? "active" : ""}`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activeTab === "testing" && (
        <TestingPortal
          focusTestId={focusTestId}
          onFocusConsumed={() => setFocusTestId(null)}
          authUser={authUser}
        />
      )}
      {activeTab === "schedule" && (
        <SchedulePage
          onOpenTask={(id) => {
            setFocusTaskId(id);
            onTabChange("tasks");
          }}
          onOpenTest={(id) => {
            setFocusTestId(id);
            onTabChange("testing");
          }}
        />
      )}
      {activeTab === "users" && <UsersArea />}
      {activeTab === "certificates" && <CertificatesAdmin />}
      {activeTab === "email" && <EmailTemplates />}
      {activeTab === "factory" && <ContentFactory />}
      {activeTab === "tasks" && (
        <TaskList
          focusTaskId={focusTaskId}
          onFocusConsumed={() => setFocusTaskId(null)}
          authUser={authUser}
        />
      )}
      {activeTab === "timesheet" && <TimesheetPage authUser={authUser} />}
      {activeTab === "financials" && isAdmin && <Financials />}
      {activeTab === "sitemap" && <SiteMapPage />}
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
