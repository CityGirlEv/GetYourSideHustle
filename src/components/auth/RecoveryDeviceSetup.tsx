import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QADevicePicker, splitDevices, mergeDevices } from "@/components/QADevicePicker";
import { saveMyQADevices } from "@/lib/qa-devices.functions";

type RecoveryDeviceSetupProps = {
  initialDevices?: string[];
  onComplete: () => void;
};

/**
 * Device preferences step shown to legacy QA users before they set a password.
 * Matches the registration device picker new registrants see.
 */
export function RecoveryDeviceSetup({ initialDevices = [], onComplete }: RecoveryDeviceSetupProps) {
  const saveDevices = useServerFn(saveMyQADevices);
  const parts = splitDevices(initialDevices);
  const [selected, setSelected] = useState(parts.selected);
  const [other, setOther] = useState(parts.other);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const merged = mergeDevices(selected, other);
    if (merged.length === 0) {
      toast.error("Select at least one device you can test on.");
      return;
    }
    setSaving(true);
    try {
      await saveDevices({ data: { qa_devices: merged } });
      toast.success("Testing devices saved.");
      onComplete();
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to save devices");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl grad-indigo">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">Confirm your testing devices</h1>
          <p className="text-sm text-muted-foreground">
            Before you set your password, tell us which devices you can test on. We use this to
            assign QA scenarios that match your hardware.
          </p>
        </div>
        <Card className="glass p-6 space-y-4">
          <QADevicePicker
            selected={selected}
            onSelectedChange={setSelected}
            other={other}
            onOtherChange={setOther}
          />
          <Button onClick={onSave} disabled={saving} className="w-full grad-indigo h-11">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Continue to set password
          </Button>
        </Card>
      </div>
    </div>
  );
}
