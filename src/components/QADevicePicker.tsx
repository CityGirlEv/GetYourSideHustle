import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const COMPUTER_DEVICES = [
  "MacBook",
  "iMac",
  "Windows desktop",
  "Windows laptop",
  "Linux",
] as const;
export const MOBILE_DEVICES = ["iPhone", "iPad", "Android phone", "Android tablet"] as const;
const KNOWN = new Set<string>([...COMPUTER_DEVICES, ...MOBILE_DEVICES]);

export function splitDevices(devices: string[]): { selected: string[]; other: string } {
  const selected: string[] = [];
  const others: string[] = [];
  for (const d of devices) {
    if (KNOWN.has(d)) selected.push(d);
    else if (d.trim()) others.push(d.trim());
  }
  return { selected, other: others.join(", ") };
}

export function mergeDevices(selected: string[], other: string): string[] {
  const extras = other
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set([...selected, ...extras]));
}

export function QADevicePicker({
  selected,
  onSelectedChange,
  other,
  onOtherChange,
}: {
  selected: string[];
  onSelectedChange: (next: string[]) => void;
  other: string;
  onOtherChange: (v: string) => void;
}) {
  const toggle = (d: string, v: boolean) =>
    onSelectedChange(v ? Array.from(new Set([...selected, d])) : selected.filter((x) => x !== d));
  return (
    <div className="space-y-3 pt-1">
      <div>
        <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
          Computer
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COMPUTER_DEVICES.map((d) => {
            const active = selected.includes(d);
            return (
              <label
                key={d}
                className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer transition ${active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}
              >
                <Checkbox checked={active} onCheckedChange={(v) => toggle(d, !!v)} />
                <span>{d}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
          Mobile device
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_DEVICES.map((d) => {
            const active = selected.includes(d);
            return (
              <label
                key={d}
                className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer transition ${active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}
              >
                <Checkbox checked={active} onCheckedChange={(v) => toggle(d, !!v)} />
                <span>{d}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div>
        <Label className="text-xs">Other (comma-separated)</Label>
        <Input
          value={other}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="e.g. Chromebook, Kindle Fire"
        />
      </div>
    </div>
  );
}
