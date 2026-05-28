import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserPlus, Loader2, Eye, EyeOff, Pencil, Trash2, Ban, CheckCircle2, Plus, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createAdvisor, listStaff, updateUser, setUserDisabled, deleteUser, addUserRole, removeUserRole } from "@/lib/admin.functions";
import { refreshAssigneeOptions } from "@/lib/use-assignee-options";
import { QADevicePicker, splitDevices, mergeDevices } from "@/components/QADevicePicker";

export const Route = createFileRoute("/users")({ component: UsersPage });

const ASSIGNABLE_ROLES = ["viewer", "editor", "qa", "agent", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

interface StaffMember {
  id: string;
  email: string;
  full_name: string;
  npn_number: string;
  role: string;
  roles: string[];
  credits: number;
  disabled?: boolean;
  last_sign_in_at?: string | null;
  qa_devices?: string[];
}

function UsersPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

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

  const fetchStaff = useServerFn(listStaff);
  const doCreate = useServerFn(createAdvisor);
  const doAddRole = useServerFn(addUserRole);
  const doRemoveRole = useServerFn(removeUserRole);
  const doUpdate = useServerFn(updateUser);
  const doSetDisabled = useServerFn(setUserDisabled);
  const doDelete = useServerFn(deleteUser);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.navigate({ to: "/auth" }); return; }
    if (user.role !== "admin") { router.navigate({ to: "/" }); return; }
  }, [user, authLoading, router]);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await fetchStaff();
      setStaff(data as StaffMember[]);
      // A staff change (enable/disable, role grant) may have added or
      // removed a QA user — refresh the assignee dropdowns app-wide.
      refreshAssigneeOptions();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (!user || user.role !== "admin") return null;

  const filtered = staff.filter((s) =>
    [s.email, s.full_name, s.role, s.npn_number].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newEmail || newPassword.length < 8) {
      toast.error("Email required and password must be at least 8 characters");
      return;
    }
    setCreating(true);
    try {
      await doCreate({ data: { email: newEmail, password: newPassword, full_name: newFullName || undefined, role: newRole } });
      toast.success(`User created (${newRole})`);
      setNewEmail(""); setNewPassword(""); setNewFullName(""); setNewRole("viewer");
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleAddRole = async (id: string, role: AssignableRole) => {
    try {
      await doAddRole({ data: { user_id: id, role } });
      toast.success(`Added role: ${role}`);
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed");
    }
  };

  const handleRemoveRole = async (id: string, role: string) => {
    try {
      await doRemoveRole({ data: { user_id: id, role: role as AssignableRole } });
      toast.success(`Removed role: ${role}`);
      await reload();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed");
    }
  };

  const openEdit = (s: StaffMember) => {
    setEditing(s); setEditName(s.full_name); setEditNpn(s.npn_number); setEditPassword("");
    const parts = splitDevices(s.qa_devices ?? []);
    setEditDevices(parts.selected);
    setEditDeviceOther(parts.other);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const isQA = (editing.roles ?? [editing.role]).includes("qa");
      await doUpdate({ data: {
        user_id: editing.id,
        full_name: editName,
        npn_number: editNpn || null,
        ...(editPassword ? { password: editPassword } : {}),
        ...(isQA ? { qa_devices: mergeDevices(editDevices, editDeviceOther) } : {}),
      }});
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
    if (error) { toast.error(error.message); return; }
    toast.success(`${amount > 0 ? "Added" : "Deducted"} ${Math.abs(amount)} credits`);
    await reload();
  };

  return (
    <AppShell title="User management" subtitle="Create, edit, disable, and remove staff accounts">
      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        <Card className="glass p-5 space-y-4 lg:sticky lg:top-24">
          <h3 className="font-display font-bold flex items-center gap-2"><UserPlus className="h-5 w-5"/>Create user account</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email</label>
              <Input type="email" placeholder="user@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Full name</label>
              <Input placeholder="Jane Smith" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Role</label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AssignableRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Password</label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} placeholder="Min 12 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating || !newEmail || newPassword.length < 12} className="w-full">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <UserPlus className="h-4 w-4 mr-2"/>}
              Create user
            </Button>
          </div>
        </Card>

        <Card className="glass p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold">All users</h3>
              <p className="text-xs text-muted-foreground">{filtered.length} of {staff.length} shown</p>
            </div>
            <div className="flex items-center gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, role…" className="w-64"/>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>}
            </div>
          </div>
          <div className="overflow-auto max-h-[60vh] space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className={`rounded-lg border border-border bg-secondary/30 p-3 space-y-2 ${s.disabled ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {(s.roles ?? [s.role]).map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs capitalize border border-border">
                          {r}
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(s.id, r)}
                            className="text-muted-foreground hover:text-destructive"
                            title={`Remove ${r}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <Select value="" onValueChange={(v) => handleAddRole(s.id, v as AssignableRole)}>
                        <SelectTrigger className="h-6 px-2 text-xs w-auto gap-1"><Plus className="h-3 w-3" /></SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.filter((r) => !(s.roles ?? [s.role]).includes(r)).map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {s.disabled
                      ? <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs">Disabled</span>
                      : <span className="px-2 py-0.5 rounded-full bg-emerald/15 text-emerald text-xs">Active</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">NPN: {s.npn_number || "—"}</span>
                  <span className="tabular-nums font-bold text-foreground">Credits: {s.credits}</span>
                  <span className="tabular-nums whitespace-nowrap">{s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleString() : "—"}</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => adjustCredits(s, 5)} title="Add 5 credits"><Plus className="h-3 w-3"/>5</Button>
                  <Button size="sm" variant="outline" onClick={() => adjustCredits(s, -1)} title="Deduct 1 credit"><Minus className="h-3 w-3"/>1</Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)} title="Edit"><Pencil className="h-3 w-3"/></Button>
                  <Button size="sm" variant="outline" onClick={() => toggleDisabled(s)} title={s.disabled ? "Enable" : "Disable"}>
                    {s.disabled ? <CheckCircle2 className="h-3 w-3"/> : <Ban className="h-3 w-3"/>}
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(s)} title="Delete"><Trash2 className="h-3 w-3"/></Button>
                </div>
              </div>
            ))}
            {!filtered.length && !loading && (
              <div className="px-3 py-6 text-center text-muted-foreground text-sm">No users found.</div>
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
              <label className="text-xs text-muted-foreground">Reset password (optional, min 8 chars)</label>
              <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={savingEdit || (!!editPassword && editPassword.length < 8)}>
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-semibold">{deleteTarget?.email}</span>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}