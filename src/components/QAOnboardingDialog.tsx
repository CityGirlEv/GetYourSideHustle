import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { getMyQADevices, saveMyQADevices } from "@/lib/qa-devices.functions";
import { QADevicePicker, splitDevices, mergeDevices } from "./QADevicePicker";
import { RESET_PASSWORD_PATH } from "@/lib/auth-recovery";

/**
 * On first sign-in (or any later sign-in if devices are missing), prompt
 * QA users to confirm/update their available testing devices.
 * Skipped on /reset-password — legacy no-password users complete devices there first.
 */
export function QAOnboardingGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, authLoading } = useApp();
  const fetchDevices = useServerFn(getMyQADevices);
  const saveDevices = useServerFn(saveMyQADevices);

  const isQA = !!user && (user.roles?.includes("qa") || user.role === "qa");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkedFor, setCheckedFor] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user || !isQA) return;
    if (pathname === RESET_PASSWORD_PATH) return;
    if (checkedFor === user.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchDevices();
        if (cancelled) return;
        const parts = splitDevices(res.qa_devices ?? []);
        setSelected(parts.selected);
        setOther(parts.other);
        setCheckedFor(user.id);
        if (!res.qa_devices || res.qa_devices.length === 0) {
          setOpen(true);
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, isQA, fetchDevices, checkedFor, pathname]);

  if (!isQA) return null;

  const onSave = async () => {
    const merged = mergeDevices(selected, other);
    if (merged.length === 0) {
      toast.error("Please select at least one device.");
      return;
    }
    setSaving(true);
    try {
      await saveDevices({ data: { qa_devices: merged } });
      toast.success("Testing devices saved.");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!saving) setOpen(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm your testing devices</DialogTitle>
          <DialogDescription>
            Welcome! Tell us which devices you can test on. We use this to assign QA scenarios that
            match your hardware. You can update this anytime from your profile.
          </DialogDescription>
        </DialogHeader>
        <QADevicePicker
          selected={selected}
          onSelectedChange={setSelected}
          other={other}
          onOtherChange={setOther}
        />
        <DialogFooter>
          <Button onClick={onSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save devices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
