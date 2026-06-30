import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calculator,
  Calendar,
  ClipboardList,
  DollarSign,
  Facebook,
  FileSignature,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Mail,
  Map,
  Megaphone,
  PenLine,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export interface AdminNavLink {
  label: string;
  to: string;
  icon: LucideIcon;
  hash?: string;
  search?: Record<string, string>;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Highlight this group in the admin menu (QA). */
  highlight?: boolean;
  items: AdminNavLink[];
}

export const ADMIN_DASHBOARD_LINK: AdminNavLink = {
  label: "Admin Dashboard",
  to: "/admin",
  icon: LayoutDashboard,
};

export const ADMIN_CONTENT_GROUP: AdminNavGroup = {
  id: "content",
  label: "Content",
  icon: Sparkles,
  items: [
    {
      label: "Content Factory",
      to: "/admin/content-factory",
      icon: Sparkles,
    },
    {
      label: "Content Calendar",
      to: "/admin/calendar",
      icon: Calendar,
    },
    {
      label: "Meta",
      to: "/admin/meta",
      icon: Megaphone,
    },
    {
      label: "Facebook Posts",
      to: "/admin/facebook-posts",
      icon: Facebook,
    },
    {
      label: "Create Article",
      to: "/admin/articles",
      icon: PenLine,
    },
    {
      label: "Newsletter Center",
      to: "/admin/newsletter",
      icon: Mail,
    },
  ],
};

export const ADMIN_QA_GROUP: AdminNavGroup = {
  id: "qa",
  label: "QA & Testing",
  icon: FlaskConical,
  highlight: true,
  items: [
    {
      label: "QA Dashboard",
      to: "/qa",
      icon: LayoutDashboard,
    },
    {
      label: "Testing Portal",
      to: "/testing",
      icon: FlaskConical,
    },
    {
      label: "Test Plan / IP",
      to: "/testing",
      hash: "ip",
      icon: ClipboardList,
    },
  ],
};

export const ADMIN_STAFF_GROUP: AdminNavGroup = {
  id: "staff",
  label: "Users",
  icon: Users,
  items: [
    {
      label: "Users",
      to: "/staff",
      icon: Users,
    },
    {
      label: "Device report",
      to: "/staff/report",
      icon: ClipboardList,
    },
  ],
};

export const ADMIN_OPERATION_LINKS: AdminNavLink[] = [
  {
    label: "Competitor Scouting",
    to: "/admin/competitor-scouting",
    icon: ShieldCheck,
  },
  {
    label: "Lead Certificates",
    to: "/admin",
    hash: "lead-certificates",
    search: { tab: "scenarios" },
    icon: ShieldCheck,
  },
  {
    label: "Task Sheet",
    to: "/tasks",
    icon: ListChecks,
  },
  {
    label: "Lead Pricing",
    to: "/admin/pricing",
    icon: DollarSign,
  },
  {
    label: "Email Templates",
    to: "/admin/email-templates",
    icon: Mail,
  },
];

export const ADMIN_REFERENCE_LINKS: AdminNavLink[] = [
  {
    label: "Training",
    to: "/admin/training",
    icon: GraduationCap,
  },
  {
    label: "Site Map",
    to: "/admin/sitemap",
    icon: Map,
  },
  {
    label: "Sources",
    to: "/sources",
    icon: BookOpen,
  },
  {
    label: "NDA",
    to: "/nda",
    icon: FileSignature,
  },
];

/** Mobile drawer sections in display order. */
export const ADMIN_MOBILE_SECTIONS: Array<
  | { type: "link"; link: AdminNavLink }
  | { type: "group"; group: AdminNavGroup }
  | { type: "links"; title: string; links: AdminNavLink[] }
> = [
  { type: "link", link: ADMIN_DASHBOARD_LINK },
  { type: "group", group: ADMIN_CONTENT_GROUP },
  { type: "group", group: ADMIN_QA_GROUP },
  { type: "links", title: "Operations", links: ADMIN_OPERATION_LINKS },
  { type: "group", group: ADMIN_STAFF_GROUP },
  { type: "links", title: "Reference", links: ADMIN_REFERENCE_LINKS },
];
