/**
 * QA test/task first-step page links — inject markdown Open [Label](/path) when a case has a page target.
 */

import { pathForView, type AppRouteView } from "./app-routes";
import { adminTabById, type AdminTab } from "./admin-nav";
import { readAdminDeepLink } from "./admin-deep-links";

/** Short labels used in “Open [Label](href)” steps. */
export const QA_PAGE_LABELS: Record<AppRouteView, string> = {
  dashboard: "Home",
  quiz: "GYSH Match Wizard",
  calculators: "Calculators",
  guides: "Guides",
  checklist: "Side Hustle Checklist",
  community: "Community",
  newsletter: "Newsletter",
  workshops: "Workshops",
  kids: "Kids & Teens Corner",
  seniors: "Seniors Corner",
  login: "Login",
  user_portal: "Member Portal",
  admin: "Admin Studio",
  about: "About",
  contact: "Contact Us",
  privacy: "Privacy Policy",
  beta_nda: "Beta Tester NDA",
  beta_testing: "Beta Tester Dashboard",
  join: "Join",
  membership_signup: "Membership Sign-up",
};

/** Alternate phrases that appear in existing step text for a view. */
const VIEW_ALIASES: Partial<Record<AppRouteView, string[]>> = {
  dashboard: ["Home", "homepage", "Homepage", "the homepage"],
  quiz: ["GYSH Match Wizard", "Find Mine", "Match Wizard", "Find My Side Hustle"],
  calculators: ["Calculators", "GYSH Profit Estimator"],
  guides: ["Guides", "Guides library", "Free Guides"],
  checklist: ["Side Hustle Checklist", "Checklist"],
  community: ["Community", "GYSH Community"],
  newsletter: ["Newsletter", "Weekly Newsletter", "GYSH Newsletter"],
  workshops: ["Workshops"],
  kids: ["Kids & Teens Corner", "Kids/Teens Corner", "Kids / Teens Corner", "Kids Corner", "Kids & Teens", "Kids/Juniors Corner"],
  seniors: ["Seniors Corner", "Seniors", "Senior Side Hustles"],
  login: ["Login", "Sign In", "GYSH Sign In"],
  user_portal: ["Member Portal", "My Dashboard", "User Portal"],
  admin: ["Admin Studio", "Admin", "GYSH Admin Studio"],
  about: ["About"],
  contact: ["Contact Us", "Contact"],
  privacy: ["Privacy Policy", "Privacy"],
  beta_nda: ["Beta Tester NDA", "Beta NDA", "NDA"],
  beta_testing: ["Beta Tester Dashboard", "Beta Testing"],
  join: ["Join", "Join GYSH", "Membership"],
  membership_signup: ["Membership Sign-up", "Membership Signup", "Sign-up"],
};

const VIEW_SET = new Set<string>(Object.keys(QA_PAGE_LABELS));

export type QaPageRef = {
  href: string;
  label: string;
  view?: AppRouteView;
};

/** Resolve a TestCase.path (view key) or absolute/relative URL into a link target. */
export function resolveQaPage(path: string | undefined | null): QaPageRef | null {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      return { href: u.toString(), label: u.pathname === "/" ? "Home" : u.pathname };
    } catch {
      return null;
    }
  }

  if (raw.startsWith("/")) {
    // Admin Studio deep links: /admin?tab=email&template=… → Email Templates (or tab label)
    if (raw === "/admin" || raw.startsWith("/admin?")) {
      const q = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
      const link = readAdminDeepLink(q);
      if (link.tab === "email") {
        const label = link.template
          ? `Email Templates · ${link.template}`
          : "Email Templates";
        return { href: raw, label, view: "admin" };
      }
      if (link.tab) {
        const tabLabel = adminTabById(link.tab)?.label ?? QA_PAGE_LABELS.admin;
        return { href: raw, label: tabLabel, view: "admin" };
      }
      return { href: pathForView("admin"), label: QA_PAGE_LABELS.admin, view: "admin" };
    }
    for (const [key, label] of Object.entries(QA_PAGE_LABELS) as [AppRouteView, string][]) {
      if (pathForView(key) === raw) {
        return { href: pathForView(key), label, view: key };
      }
    }
    return { href: raw, label: raw === "/" ? "Home" : raw };
  }

  // admin:email[:slug] | admin:testing | admin → deep Admin Studio targets
  if (raw === "admin" || raw.startsWith("admin:") || raw.startsWith("admin/")) {
    const rest = raw.replace(/^admin[/:]?/i, "").trim();
    if (!rest) {
      return { href: pathForView("admin"), label: QA_PAGE_LABELS.admin, view: "admin" };
    }
    const [tabRaw, templateRaw] = rest.split(/[/:]/).filter(Boolean);
    const tab = (tabRaw || "").toLowerCase() as AdminTab;
    if (tab === "email") {
      const template = (templateRaw || "").trim();
      const href = template
        ? `/admin?tab=email&template=${encodeURIComponent(template)}`
        : "/admin?tab=email";
      return {
        href,
        label: template ? `Email Templates · ${template}` : "Email Templates",
        view: "admin",
      };
    }
    if (adminTabById(tab)) {
      return {
        href: `/admin?tab=${encodeURIComponent(tab)}`,
        label: adminTabById(tab)!.label,
        view: "admin",
      };
    }
    return { href: pathForView("admin"), label: QA_PAGE_LABELS.admin, view: "admin" };
  }

  if (VIEW_SET.has(raw)) {
    const view = raw as AppRouteView;
    return { href: pathForView(view), label: QA_PAGE_LABELS[view], view };
  }

  return null;
}

export function openPageStepMarkdown(path: string): string | null {
  const page = resolveQaPage(path);
  if (!page) return null;
  return `Open [${page.label}](${page.href})`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Ensure step 1 includes a clickable markdown link to the page.
 * Does not change step count (injects into step 1) so checked-step indexes stay valid.
 */
export function ensureFirstStepHasPageLink(steps: string[], path?: string | null): string[] {
  const page = resolveQaPage(path);
  if (!page) return steps;

  const link = `[${page.label}](${page.href})`;
  const openStep = `Open ${link}`;

  if (!steps.length) return [openStep];

  const first = steps[0] ?? "";
  if (first.includes(`](${page.href})`) || first.includes(link)) {
    return steps;
  }
  // Already has some markdown page link — leave alone
  if (/\[[^\]]+\]\(\/[^)]*\)/.test(first) || /\[[^\]]+\]\(https?:\/\/[^)]+\)/i.test(first)) {
    return steps;
  }

  const aliases = page.view
    ? [page.label, ...(VIEW_ALIASES[page.view] ?? [])]
    : [page.label];
  // Longer aliases first so "Kids & Teens Corner" wins over "Kids"
  const sorted = [...new Set(aliases)].sort((a, b) => b.length - a.length);

  for (const alias of sorted) {
    const re = new RegExp(`\\b((?:Open|Load|Click)(?:\\s+the)?\\s+)${escapeRegExp(alias)}\\b`, "i");
    if (re.test(first)) {
      return [first.replace(re, `$1${link}`), ...steps.slice(1)];
    }
  }

  // "Admin → Testing Portal" style
  if (page.view === "admin" && /^admin\b/i.test(first)) {
    return [`Open ${link} — ${first}`, ...steps.slice(1)];
  }

  if (/^open\b/i.test(first)) {
    return [`Open ${link} — ${first.replace(/^open\s+/i, "")}`, ...steps.slice(1)];
  }

  return [`${openStep} — ${first}`, ...steps.slice(1)];
}

export function withPageLinkInFirstStep<T extends { steps: string[]; path?: string }>(t: T): T {
  return { ...t, steps: ensureFirstStepHasPageLink(t.steps, t.path) };
}

const MD_LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * True for off-site / non-app targets that should open in a new tab.
 * Same-origin app paths must stay in this tab — GYSH auth is sessionStorage-scoped
 * per tab, so target=_blank looks like a logout (/admin → login).
 */
export function isExternalHref(
  href: string,
  pageOrigin: string = typeof window !== "undefined" ? window.location.origin : "",
): boolean {
  const raw = String(href || "").trim();
  if (!raw) return false;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (!pageOrigin) return true;
      return u.origin !== pageOrigin;
    } catch {
      return true;
    }
  }
  // mailto:, tel:, javascript:, etc.
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return true;
  return false;
}

/** Split text into plain runs and markdown links for React rendering. */
export function parseMarkdownLinks(
  text: string,
): Array<{ type: "text"; value: string } | { type: "link"; label: string; href: string }> {
  const out: Array<{ type: "text"; value: string } | { type: "link"; label: string; href: string }> =
    [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(MD_LINK_RE.source, "g");
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", value: text.slice(last, m.index) });
    }
    out.push({ type: "link", label: m[1]!, href: m[2]! });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ type: "text", value: text.slice(last) });
  }
  if (out.length === 0) {
    out.push({ type: "text", value: text });
  }
  return out;
}

/** Infer a page link for a Task List item from id / notes / description / category. */
export function pageRefForTask(task: {
  id?: string;
  description?: string;
  notes?: string;
  category?: string;
}): QaPageRef | null {
  const id = String(task.id ?? "");
  const notes = String(task.notes ?? "");
  const desc = String(task.description ?? "");
  const category = String(task.category ?? "");

  if (id === "T-SENIOR-PAGE" || notes.includes("page-review:senior") || /senior side hustles page/i.test(desc)) {
    return resolveQaPage("seniors");
  }
  if (id.startsWith("T-LG-") || notes.includes("guide-review:") || /^Review Launch Guide:/i.test(desc)) {
    return resolveQaPage("guides");
  }
  if (
    id.startsWith("T-MEM-") ||
    notes.includes("membership-tier-review:") ||
    /^Review Membership level:/i.test(desc)
  ) {
    return resolveQaPage("join");
  }
  if (category === "kids_corner" || /\bkids\b.*\b(corner|page)\b/i.test(desc)) {
    return resolveQaPage("kids");
  }
  if (category === "workshops" || /\bworkshops?\b.*\bpage\b/i.test(desc)) {
    return resolveQaPage("workshops");
  }
  if (category === "senior_side_hustles") {
    return resolveQaPage("seniors");
  }
  if (/\bcontact\b.*\bpage\b/i.test(desc) || /^Review Contact/i.test(desc)) {
    return resolveQaPage("contact");
  }
  if (/\b(join|membership)\b.*\bpage\b/i.test(desc)) {
    return resolveQaPage("join");
  }
  if (/\babout\b.*\bpage\b/i.test(desc)) {
    return resolveQaPage("about");
  }
  if (/\bprivacy policy\b/i.test(desc) || /\bprivacy\b.*\bpage\b/i.test(desc)) {
    return resolveQaPage("privacy");
  }
  if (/\bbeta tester nda\b/i.test(desc) || /\bnda\b.*\bpage\b/i.test(desc)) {
    return resolveQaPage("beta_nda");
  }
  if (/\b(home|homepage|landing)\b/i.test(desc) && /\b(page|review|verbiage)\b/i.test(desc)) {
    return resolveQaPage("dashboard");
  }
  if (/\bchecklist\b/i.test(desc)) {
    return resolveQaPage("checklist");
  }
  if (/\b(match wizard|find mine)\b/i.test(desc)) {
    return resolveQaPage("quiz");
  }
  if (/\bcalculators?\b/i.test(desc) && /\b(page|review|test)\b/i.test(desc)) {
    return resolveQaPage("calculators");
  }
  if (/\bcommunity\b.*\bpage\b/i.test(desc)) {
    return resolveQaPage("community");
  }
  if (/\bnewsletter\b/i.test(desc)) {
    return resolveQaPage("newsletter");
  }
  if (/\b(admin studio|testing portal|task list|schedule)\b/i.test(desc)) {
    return resolveQaPage("admin");
  }

  // Notes already contain an Open [Label](/path) line
  const noteLink = notes.match(/Open\s+\[([^\]]+)\]\(([^)\s]+)\)/i);
  if (noteLink) {
    return { href: noteLink[2]!, label: noteLink[1]! };
  }

  return null;
}

/** First-step markdown line for a task that targets a page. */
export function taskOpenPageStep(task: {
  id?: string;
  description?: string;
  notes?: string;
  category?: string;
}): string | null {
  const page = pageRefForTask(task);
  if (!page) return null;
  return `Open [${page.label}](${page.href})`;
}

/** Ensure notes begin with an Open [Page](path) line when the task refers to a page. */
export function ensureTaskNotesPageLink(notes: string, task: {
  id?: string;
  description?: string;
  notes?: string;
  category?: string;
}): string {
  const open = taskOpenPageStep({ ...task, notes });
  if (!open) return notes;
  const href = pageRefForTask(task)?.href;
  const trimmed = String(notes ?? "").trim();
  if (href && trimmed.includes(`](${href})`)) return notes;
  if (!trimmed) return open;
  // Structured note threads: keep as-is if any entry already has the link.
  if (trimmed.startsWith("[")) {
    if (href && trimmed.includes(`](${href})`)) return notes;
    return notes;
  }
  if (/^Open\s+\[[^\]]+\]\([^)]+\)/i.test(trimmed)) return notes;
  return `${open}\n${trimmed}`;
}
