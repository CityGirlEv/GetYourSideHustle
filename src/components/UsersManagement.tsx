import { useApp } from "@/lib/app-store";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  Send,
  FileDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import {
  createAdvisor,
  listStaff,
  updateUser,
  setUserDisabled,
  deleteUser,
  addUserRole,
  removeUserRole,
  setUserEmailConfirmed,
  bulkUpdateUsers,
  getUserReportData,
} from "@/lib/admin.functions";
import { refreshAssigneeOptions } from "@/lib/use-assignee-options";
import { refreshQaOwnerOptions } from "@/lib/use-qa-owner-options";
import { refreshQaTesters } from "@/lib/use-qa-testers";
import { QADevicePicker, splitDevices, mergeDevices } from "@/components/QADevicePicker";
import { MultiSelect } from "@/components/ui/multi-select";
import { StaffSubNav } from "@/components/StaffSubNav";
import { StaffEmailMenu } from "@/components/StaffEmailMenu";
import {
  sendStaffAssignmentEmails,
  listStaffEmailHistory,
  type StaffEmailTemplateGroup,
} from "@/lib/staff-email.functions";
import {
  getAssignedTestsForAssignee,
  type AssignedTestRow,
} from "@/lib/qa-test-assignment.functions";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  canManageLeadsAdminRole,
  isLeadsAdminOwnerEmail,
  LEADS_ADMIN_ROLE,
} from "@/lib/leads-admin";

const ASSIGNABLE_ROLES = ["client", "viewer", "editor", "qa", "agent", "customer", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

const ROLE_FILTER_OPTIONS = ASSIGNABLE_ROLES.map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

function formatUserTimestamp(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

const ASSIGNED_TEST_STATUS_ORDER = [
  "fail",
  "failed_retest",
  "blocked",
  "in_progress",
  "fixed_retest",
  "not_run",
  "pass",
] as const;

function groupAssignedTestsByStatus(tests: AssignedTestRow[]) {
  const grouped = tests.reduce(
    (acc, test) => {
      const key = test.status || "not_run";
      if (!acc[key]) {
        acc[key] = {
          label: test.statusLabel || "Not run",
          tests: [],
        };
      }
      acc[key].tests.push(test);
      return acc;
    },
    {} as Record<string, { label: string; tests: AssignedTestRow[] }>,
  );

  return Object.keys(grouped)
    .sort((a, b) => {
      const idxA = ASSIGNED_TEST_STATUS_ORDER.indexOf(a as (typeof ASSIGNED_TEST_STATUS_ORDER)[number]);
      const idxB = ASSIGNED_TEST_STATUS_ORDER.indexOf(b as (typeof ASSIGNED_TEST_STATUS_ORDER)[number]);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    })
    .map((statusKey) => ({ statusKey, ...grouped[statusKey]! }));
}

function assignedTestStatusClass(status: string) {
  return cn(
    "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ml-2",
    status === "pass" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-300",
    (status === "fail" || status === "failed_retest") &&
    "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-300",
    status === "blocked" && "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300",
    (status === "in_progress" || status === "fixed_retest") &&
    "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-blue-300",
    status === "not_run" && "bg-slate-100 text-slate-800 dark:bg-slate-900/35 dark:text-slate-300",
  );
}

const collapsibleSummaryClass =
  "px-2 py-1.5 font-medium cursor-pointer select-none outline-none flex justify-between items-center gap-2 hover:bg-muted/40 [&::-webkit-details-marker]:hidden list-none";

function CollapsibleChevron() {
  return (
    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
  );
}

interface StaffMember {
  id: string;
  email: string;
  full_name: string;
  npn_number: string;
  role: string;
  roles: string[];
  credits: number;
  disabled?: boolean;
  email_confirmed?: boolean;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  qa_devices?: string[];
}

function UserEmailLogs({ email }: { email: string }) {
  const fetchHistory = useServerFn(listStaffEmailHistory);
  const [logs, setLogs] = useState<StaffEmailTemplateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !loaded && !loading) {
      setLoading(true);
      fetchHistory({ data: { recipientEmail: email, limit: 50 } })
        .then((data) => {
          setLogs(data);
          setLoaded(true);
        })
        .catch((err) => {
          toast.error("Failed to load email history: " + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, email, loaded, loading, fetchHistory]);

  const totalLogs = logs.reduce((acc, group) => acc + (group.entries?.length || 0), 0);

  return (
    <details
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-2 text-xs border border-border rounded-md bg-muted/10 overflow-hidden"
    >
      <summary className="px-3 py-2 font-medium cursor-pointer bg-muted/30 hover:bg-muted/50 select-none outline-none flex justify-between items-center">
        <span>Letters / Emails Sent</span>
        <span className="text-muted-foreground">{loaded ? `(${totalLogs})` : "…"}</span>
      </summary>
      <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto border-t border-border">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading email logs…
          </div>
        )}
        {loaded && logs.length === 0 && (
          <div className="text-muted-foreground py-1">No emails logged for this user.</div>
        )}
        {loaded &&
          logs.map((group) => (
            <details
              key={group.templateName}
              className="group border border-border/50 rounded-md overflow-hidden bg-background/50"
            >
              <summary className={cn(collapsibleSummaryClass, "bg-muted/20 text-foreground font-semibold")}>
                <span className="flex items-center gap-1.5 min-w-0">
                  <CollapsibleChevron />
                  <span className="truncate">{group.displayName}</span>
                </span>
                <span className="text-muted-foreground font-normal shrink-0">
                  ({group.entries?.length || 0})
                </span>
              </summary>
              <ul className="list-disc pl-5 pr-2 py-2 space-y-1 text-muted-foreground border-t border-border/40">
                {(group.entries || []).map((entry) => (
                  <li key={entry.id}>
                    <span className="capitalize font-medium text-foreground">{entry.status}</span>
                    {" · "}
                    <span className="tabular-nums">{new Date(entry.created_at).toLocaleString()}</span>
                    {entry.error_message && (
                      <div className="text-destructive text-[10px] mt-0.5">{entry.error_message}</div>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ))}
      </div>
    </details>
  );
}

function UserAssignedTests({ assigneeLabel }: { assigneeLabel: string }) {
  const fetchTests = useServerFn(getAssignedTestsForAssignee);
  const [tests, setTests] = useState<AssignedTestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  const testsByStatus = useMemo(() => groupAssignedTestsByStatus(tests), [tests]);

  useEffect(() => {
    if (open && !loaded && !loading) {
      setLoading(true);
      fetchTests({ data: { assigneeLabel } })
        .then((data) => {
          setTests(data);
          setLoaded(true);
        })
        .catch((err) => {
          toast.error("Failed to load tests: " + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, assigneeLabel, loaded, loading, fetchTests]);

  return (
    <details
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-2 text-xs border border-border rounded-md bg-muted/10 overflow-hidden"
    >
      <summary className="px-3 py-2 font-medium cursor-pointer bg-muted/30 hover:bg-muted/50 select-none outline-none flex justify-between items-center">
        <span>Assigned QA Tests</span>
        <span className="text-muted-foreground">{loaded ? `(${tests.length})` : "…"}</span>
      </summary>
      <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto border-t border-border">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading tests…
          </div>
        )}
        {loaded && tests.length === 0 && (
          <div className="text-muted-foreground py-1">No tests assigned to this tester.</div>
        )}
        {loaded &&
          testsByStatus.map((group) => (
            <details
              key={group.statusKey}
              className="group border border-border/50 rounded-md overflow-hidden bg-background/50"
            >
              <summary className={cn(collapsibleSummaryClass, "bg-muted/20 text-foreground font-semibold")}>
                <span className="flex items-center gap-1.5 min-w-0">
                  <CollapsibleChevron />
                  <span className="truncate">{group.label}</span>
                </span>
                <span className="text-muted-foreground font-normal shrink-0">({group.tests.length})</span>
              </summary>
              <div className="px-2 py-1.5 space-y-1.5 border-t border-border/40">
                {group.tests.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-start border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground">{t.id}</span>
                      {t.area ? (
                        <span className="text-muted-foreground font-normal"> · {t.area}</span>
                      ) : null}
                      {t.isNew ? (
                        <span className="text-blue-600 dark:text-blue-400 font-medium"> · New</span>
                      ) : null}
                      <div className="text-muted-foreground text-[11px] mt-0.5">{t.title}</div>
                    </div>
                    <span className={assignedTestStatusClass(t.status)}>{t.statusLabel}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
      </div>
    </details>
  );
}

/** Admin-only user roster — create, roles, credits, disable/delete. */
export function UsersManagement() {
  const { user } = useApp();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  const [pdfLoading, setPdfLoading] = useState(false);
  const fetchReportData = useServerFn(getUserReportData);

  const handleDownloadPdfReport = async () => {
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const data = await fetchReportData();
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Part B Optimizer — User Details Report", margin, y);
      y += 24;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
      y += 20;

      // Group by role
      const roles = ["leads_admin", "admin", "qa", "agent", "editor", "client", "viewer", "advisor"];
      for (const role of roles) {
        const primaryRoleUsers = data.filter((u: any) => u.role === role);
        if (primaryRoleUsers.length === 0) continue;

        if (y > pageH - 80) {
          doc.addPage();
          y = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 40, 112); // Premium Navy color
        doc.text(`Role: ${role.toUpperCase()} (${primaryRoleUsers.length} users)`, margin, y);
        y += 16;
        doc.setTextColor(0);

        for (const u of primaryRoleUsers) {
          if (y > pageH - 100) {
            doc.addPage();
            y = margin;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${u.full_name || "—"} (${u.email})`, margin, y);
          y += 12;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(`NPN: ${u.npn_number || "—"}  |  Credits: ${u.credits}  |  Last login: ${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}`, margin + 15, y);
          y += 12;

          if (u.qa_devices && u.qa_devices.length > 0) {
            doc.text(`Devices: ${u.qa_devices.join(", ")}`, margin + 15, y);
            y += 12;
          }

          // Assigned QA Tests
          if (u.assignedTests && u.assignedTests.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Assigned QA Tests:", margin + 15, y);
            y += 10;
            doc.setFont("helvetica", "normal");
            for (const t of u.assignedTests) {
              if (y > pageH - 40) {
                doc.addPage();
                y = margin;
              }
              doc.text(`• ${t.id} - ${t.title} [Status: ${t.status}]`, margin + 25, y);
              y += 11;
            }
          }

          // Email logs
          if (u.emailLogs && u.emailLogs.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Letters / Emails Sent:", margin + 15, y);
            y += 10;
            doc.setFont("helvetica", "normal");
            const latestLogs = u.emailLogs.slice(0, 10);
            for (const log of latestLogs) {
              if (y > pageH - 40) {
                doc.addPage();
                y = margin;
              }
              const dateStr = new Date(log.created_at).toLocaleString();
              doc.text(`• ${log.template_name.replace(/-/g, " ")} (${log.status}) - ${dateStr}`, margin + 25, y);
              y += 11;
            }
            if (u.emailLogs.length > 10) {
              doc.text(`• ... and ${u.emailLogs.length - 10} more emails.`, margin + 25, y);
              y += 11;
            }
          }

          y += 8; // Spacer between users
        }
        y += 10; // Spacer between roles
      }

      doc.save(`medicare-optimizer-user-report-${Date.now()}.pdf`);
      toast.success("PDF User Report downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF: " + (err as Error).message);
    } finally {
      setPdfLoading(false);
    }
  };

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<AssignableRole>("viewer");
  const [creating, setCreating] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editNpn, setEditNpn] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editDevices, setEditDevices] = useState<string[]>([]);
  const [editDeviceOther, setEditDeviceOther] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [roleBusy, setRoleBusy] = useState<string | null>(null);
  const [emailConfirmBusy, setEmailConfirmBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [emailBulkBusy, setEmailBulkBusy] = useState(false);

  const fetchStaff = useServerFn(listStaff);
  const doCreate = useServerFn(createAdvisor);
  const doAddRole = useServerFn(addUserRole);
  const doRemoveRole = useServerFn(removeUserRole);
  const doUpdate = useServerFn(updateUser);
  const doSetDisabled = useServerFn(setUserDisabled);
  const doDelete = useServerFn(deleteUser);
  const doSetEmailConfirmed = useServerFn(setUserEmailConfirmed);
  const doBulkUpdate = useServerFn(bulkUpdateUsers);
  const doSendAssignmentEmails = useServerFn(sendStaffAssignmentEmails);

  const reload = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchStaff();
      setStaff(data as StaffMember[]);
      refreshAssigneeOptions();
      refreshQaOwnerOptions();
      refreshQaTesters();
    } catch (e: unknown) {
      const message = (e as Error)?.message ?? "Failed to load users";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userHasAdminRole(user)) return;
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const selectedQaAssignees = useMemo(
    () =>
      staff
        .filter((s) => selected.has(s.id) && (s.roles ?? [s.role]).includes("qa"))
        .map((s) => (s.full_name || s.email).trim().split(/\s+/)[0] || "")
        .filter(Boolean),
    [staff, selected],
  );

  if (!user || !userHasAdminRole(user)) return null;

  const memberRoles = (s: StaffMember) => new Set(s.roles ?? [s.role]);
  const isQaMember = (s: StaffMember) => memberRoles(s).has("qa");
  const assigneeLabelFor = (s: StaffMember) =>
    (s.full_name || s.email).trim().split(/\s+/)[0] || "";

  const bulkSendAssignmentEmails = async () => {
    if (!selectedQaAssignees.length) {
      toast.error("Select at least one QA user to send assignment emails");
      return;
    }
    setEmailBulkBusy(true);
    try {
      const result = await doSendAssignmentEmails({ data: { assignees: selectedQaAssignees } });
      if (result.sent > 0) {
        toast.success(
          `Assignment email queued for ${result.sent} tester${result.sent === 1 ? "" : "s"}`,
        );
      }
      if (result.skipped > 0) {
        toast.message(`${result.skipped} skipped (no matching email or suppressed)`);
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Bulk email failed");
    } finally {
      setEmailBulkBusy(false);
    }
  };

  const matchesRoleFilter = (s: StaffMember) => {
    if (roleFilter.length === 0) return true;
    if (roleFilter.length === 1 && roleFilter[0] === "__none__") return false;
    const roles = memberRoles(s);
    return roleFilter.some((r) => roles.has(r));
  };

  const filtered = staff.filter((s) => {
    const textMatch = [s.email, s.full_name, s.role, ...(s.roles ?? []), s.npn_number]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase());
    return textMatch && matchesRoleFilter(s);
  });

  const filteredIds = filtered.map((s) => s.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const selectedCount = selected.size;

  const toggleSelected = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const id of filteredIds) next.delete(id);
      } else {
        for (const id of filteredIds) next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const runBulk = async (patch: {
    disabled?: boolean;
    email_confirmed?: boolean;
    add_role?: AssignableRole;
    remove_role?: AssignableRole;
  }) => {
    const user_ids = Array.from(selected);
    if (!user_ids.length) return;
    setBulkBusy(true);
    try {
      const result = await doBulkUpdate({ data: { user_ids, ...patch } });
      if (result.failed > 0) {
        toast.error(`Updated ${result.applied}; ${result.failed} failed`);
      } else {
        toast.success(`Updated ${result.applied} user${result.applied === 1 ? "" : "s"}`);
      }
      clearSelection();
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Bulk update failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!newEmail || newPassword.length < 8) {
      toast.error("Email required and password must be at least 8 characters");
      return;
    }
    setCreating(true);
    try {
      await doCreate({
        data: {
          email: newEmail,
          password: newPassword,
          full_name: newFullName || undefined,
          role: newRole,
        },
      });
      toast.success(`User created (${newRole})`);
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewRole("viewer");
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = async (member: StaffMember, role: AssignableRole, checked: boolean) => {
    const key = `${member.id}:${role}`;
    setRoleBusy(key);
    try {
      if (checked) {
        await doAddRole({ data: { user_id: member.id, role } });
        toast.success(`Added role: ${role}`);
      } else {
        await doRemoveRole({ data: { user_id: member.id, role } });
        toast.success(`Removed role: ${role}`);
      }
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to update role");
    } finally {
      setRoleBusy(null);
    }
  };

  const handleToggleLeadsAdmin = async (member: StaffMember, checked: boolean) => {
    if (!user || !canManageLeadsAdminRole(user.email, member.id, user.id)) return;
    const key = `${member.id}:${LEADS_ADMIN_ROLE}`;
    setRoleBusy(key);
    try {
      if (checked) {
        await doAddRole({ data: { user_id: member.id, role: LEADS_ADMIN_ROLE } });
        toast.success("Added role: Leads Admin");
      } else {
        await doRemoveRole({ data: { user_id: member.id, role: LEADS_ADMIN_ROLE } });
        toast.success("Removed role: Leads Admin");
      }
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to update Leads Admin role");
    } finally {
      setRoleBusy(null);
    }
  };

  const handleToggleEmailConfirmed = async (member: StaffMember, confirmed: boolean) => {
    setEmailConfirmBusy(member.id);
    try {
      await doSetEmailConfirmed({ data: { user_id: member.id, confirmed } });
      toast.success(confirmed ? "Email marked confirmed" : "Email confirmation cleared");
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to update email status");
    } finally {
      setEmailConfirmBusy(null);
    }
  };

  const legacyRoles = (s: StaffMember) =>
    (s.roles ?? [s.role]).filter(
      (r) =>
        !ASSIGNABLE_ROLES.includes(r as AssignableRole) &&
        !(r === LEADS_ADMIN_ROLE && isLeadsAdminOwnerEmail(user?.email) && s.id === user?.id),
    );

  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setEditName(s.full_name);
    setEditNpn(s.npn_number);
    setEditPassword("");
    const parts = splitDevices(s.qa_devices ?? []);
    setEditDevices(parts.selected);
    setEditDeviceOther(parts.other);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const isQA = (editing.roles ?? [editing.role]).includes("qa");
      await doUpdate({
        data: {
          user_id: editing.id,
          full_name: editName,
          npn_number: editNpn || null,
          ...(editPassword ? { password: editPassword } : {}),
          ...(isQA ? { qa_devices: mergeDevices(editDevices, editDeviceOther) } : {}),
        },
      });
      toast.success("User updated");
      setEditing(null);
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to update");
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleDisabled = async (s: StaffMember) => {
    try {
      await doSetDisabled({ data: { user_id: s.id, disabled: !s.disabled } });
      toast.success(s.disabled ? "User enabled" : "User disabled");
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await doDelete({ data: { user_id: deleteTarget.id } });
      toast.success(`Deleted ${deleteTarget.email}`);
      setDeleteTarget(null);
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to delete");
    }
  };

  const adjustCredits = async (s: StaffMember, amount: number) => {
    const { error } = await supabase.rpc("admin_adjust_credits", {
      p_target: s.id,
      p_amount: amount,
      p_description: amount > 0 ? `Admin top-up +${amount}` : `Admin deduction ${amount}`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${amount > 0 ? "Added" : "Deducted"} ${Math.abs(amount)} credits`);
    await reload();
  };

  return (
    <AppShell
      title="Staff"
      subtitle="Create, edit, disable, and remove staff accounts · role toggles, bulk actions, email confirmed"
    >
      <StaffSubNav active="roster" className="mb-4" />
      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        <Card className="glass p-5 space-y-4 lg:sticky lg:top-24">
          <h3 className="font-display font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create user account
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Full name</label>
              <Input
                placeholder="Jane Smith"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Role</label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AssignableRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating || !newEmail || newPassword.length < 12}
              className="w-full"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Create user
            </Button>
          </div>
        </Card>

        <Card className="glass p-4 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold">All users</h3>
              <p className="text-xs text-muted-foreground">
                {filtered.length} of {staff.length} shown
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, role…"
                className="h-9 w-56 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs gap-1 border-primary/35 hover:bg-primary/5 hover:text-primary shrink-0"
                onClick={handleDownloadPdfReport}
                disabled={pdfLoading}
                title="Download user report grouped by role as PDF"
              >
                {pdfLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileDown className="h-3.5 w-3.5" />
                )}
                Report PDF
              </Button>
              <MultiSelect
                placeholder="Role"
                triggerClassName="w-[160px]"
                options={ROLE_FILTER_OPTIONS}
                value={roleFilter}
                onChange={setRoleFilter}
                allLabel="All roles"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>

          <Card className="p-3 bg-background/95 backdrop-blur border-primary/30">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label className="inline-flex items-center gap-2 font-semibold select-none cursor-pointer">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={() => toggleSelectAllFiltered()}
                  disabled={!filtered.length || bulkBusy}
                />
                {allFilteredSelected ? "Deselect all" : "Select all"}
                <span className="opacity-60 font-normal">({filtered.length})</span>
              </label>
              {selectedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  {selectedCount} selected
                </span>
              )}
              {selectedCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={clearSelection}
                  disabled={bulkBusy}
                >
                  Clear
                </Button>
              )}
              <span className="flex-1 min-w-[0.5rem]" />
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                disabled={!selectedCount || bulkBusy}
                onClick={() => void runBulk({ disabled: false })}
              >
                Enable
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                disabled={!selectedCount || bulkBusy}
                onClick={() => void runBulk({ disabled: true })}
              >
                Disable
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                disabled={!selectedCount || bulkBusy}
                onClick={() => void runBulk({ email_confirmed: true })}
              >
                Confirm email
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                disabled={!selectedCount || bulkBusy || emailBulkBusy}
                onClick={() => void runBulk({ email_confirmed: false })}
              >
                Unconfirm email
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                disabled={!selectedQaAssignees.length || bulkBusy || emailBulkBusy}
                onClick={() => void bulkSendAssignmentEmails()}
                title="Send beta test assignment roster email to selected QA users"
              >
                {emailBulkBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1" />
                )}
                Send assignment email
              </Button>
              <Select
                disabled={!selectedCount || bulkBusy}
                onValueChange={(role) => {
                  if (role) void runBulk({ add_role: role as AssignableRole });
                }}
              >
                <SelectTrigger
                  className="h-8 w-[8.5rem] text-xs"
                  title="Add role to selected users"
                >
                  <SelectValue placeholder="Add role…" />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                disabled={!selectedCount || bulkBusy}
                onValueChange={(role) => {
                  if (role) void runBulk({ remove_role: role as AssignableRole });
                }}
              >
                <SelectTrigger
                  className="h-8 w-[9.5rem] text-xs"
                  title="Remove role from selected users"
                >
                  <SelectValue placeholder="Remove role…" />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {bulkBusy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </Card>

          <div className="overflow-auto max-h-[65vh] space-y-3 pr-1">
            {filtered.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "rounded-xl border border-border bg-card/80 px-4 py-3 space-y-3 shadow-sm",
                  s.disabled && "opacity-65",
                  selected.has(s.id) && "ring-2 ring-primary/35 border-primary/40",
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    className="mt-1 shrink-0"
                    checked={selected.has(s.id)}
                    onCheckedChange={(v) => toggleSelected(s.id, v === true)}
                    disabled={bulkBusy}
                    aria-label={`Select ${s.full_name || s.email}`}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-base">{s.full_name || "—"}</span>
                      {s.disabled ? (
                        <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-medium">
                          Disabled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald/15 text-emerald text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{s.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <StaffEmailMenu
                      email={s.email}
                      assigneeLabel={assigneeLabelFor(s)}
                      isQa={isQaMember(s)}
                      disabled={bulkBusy || emailBulkBusy}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => adjustCredits(s, 5)}
                      title="Add 5 credits"
                    >
                      <span className="text-[10px] font-bold">+5</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => adjustCredits(s, -1)}
                      title="Deduct 1 credit"
                    >
                      <span className="text-[10px] font-bold">−1</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => openEdit(s)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => toggleDisabled(s)}
                      title={s.disabled ? "Enable" : "Disable"}
                    >
                      {s.disabled ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(s)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-8">
                  <span className="text-xs font-medium text-muted-foreground mr-1">Roles</span>
                  {ASSIGNABLE_ROLES.map((role) => {
                    const hasRole = memberRoles(s).has(role);
                    const busy = roleBusy === `${s.id}:${role}`;
                    const lockOwnAdmin = role === "admin" && s.id === user.id && hasRole;
                    return (
                      <Button
                        key={role}
                        type="button"
                        size="sm"
                        variant={hasRole ? "default" : "outline"}
                        className="h-8 px-3 text-xs capitalize"
                        disabled={busy || lockOwnAdmin || bulkBusy}
                        onClick={() => void handleToggleRole(s, role, !hasRole)}
                      >
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : role}
                      </Button>
                    );
                  })}
                  {isLeadsAdminOwnerEmail(user.email) &&
                    s.id === user.id &&
                    (() => {
                      const hasRole = memberRoles(s).has(LEADS_ADMIN_ROLE);
                      const busy = roleBusy === `${s.id}:${LEADS_ADMIN_ROLE}`;
                      return (
                        <Button
                          key={LEADS_ADMIN_ROLE}
                          type="button"
                          size="sm"
                          variant={hasRole ? "default" : "outline"}
                          className="h-8 px-3 text-xs"
                          disabled={busy || bulkBusy}
                          onClick={() => void handleToggleLeadsAdmin(s, !hasRole)}
                          title="Leads Admin can view all scenarios"
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Leads Admin"
                          )}
                        </Button>
                      );
                    })()}
                  {legacyRoles(s).map((role) => (
                    <span
                      key={role}
                      className="px-2 py-1 rounded-md bg-muted text-xs capitalize border border-border"
                    >
                      {role}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pl-8 pt-1 border-t border-border/50">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">NPN</span> {s.npn_number || "—"}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Credits</span> {s.credits}
                    </span>
                    <span className="tabular-nums">
                      <span className="font-medium text-foreground">Last login</span>{" "}
                      {s.last_sign_in_at ? formatUserTimestamp(s.last_sign_in_at) : "Never"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`email-confirmed-${s.id}`}
                        className="text-xs font-medium text-muted-foreground cursor-pointer"
                      >
                        Email confirmed
                      </Label>
                      {emailConfirmBusy === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Switch
                          id={`email-confirmed-${s.id}`}
                          checked={!!s.email_confirmed}
                          disabled={bulkBusy}
                          onCheckedChange={(checked) => void handleToggleEmailConfirmed(s, checked)}
                          aria-label={`Email confirmed for ${s.email}`}
                        />
                      )}
                    </div>
                    {s.email_confirmed && s.email_confirmed_at && (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 tabular-nums">
                        Confirmed {formatUserTimestamp(s.email_confirmed_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pl-8 pt-2 space-y-2 border-t border-border/50">
                  {memberRoles(s).has("qa") && (
                    <UserAssignedTests assigneeLabel={s.full_name ? s.full_name.split(/\s+/)[0] || "" : ""} />
                  )}
                  <UserEmailLogs email={s.email} />
                </div>
              </div>
            ))}
            {!filtered.length && !loading && (
              <div className="px-3 py-10 text-center text-sm space-y-3">
                {loadError ? (
                  <>
                    <p className="text-destructive">{loadError}</p>
                    <Button size="sm" variant="outline" onClick={() => void reload()}>
                      Retry
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">No users found.</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Full name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">NPN number</label>
              <Input value={editNpn} onChange={(e) => setEditNpn(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Reset password (optional, min 8 chars)
              </label>
              <Input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
            {editing && (editing.roles ?? [editing.role]).includes("qa") && (
              <div className="space-y-1 rounded-md border border-border p-3 bg-muted/20">
                <label className="text-xs text-muted-foreground">
                  Available testing devices (QA)
                </label>
                <QADevicePicker
                  selected={editDevices}
                  onSelectedChange={setEditDevices}
                  other={editDeviceOther}
                  onOtherChange={setEditDeviceOther}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              disabled={savingEdit || (!!editPassword && editPassword.length < 8)}
            >
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-semibold">{deleteTarget?.email}</span>.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
