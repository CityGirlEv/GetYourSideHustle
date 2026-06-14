import { COMPUTER_DEVICES, MOBILE_DEVICES } from "@/components/QADevicePicker";

/** Canonical device labels shown in admin filters (registration + onboarding). */
export const QA_DEVICE_FILTER_OPTIONS = [...COMPUTER_DEVICES, ...MOBILE_DEVICES] as const;

export type QaDeviceFilterOption = (typeof QA_DEVICE_FILTER_OPTIONS)[number];

export function normalizeDeviceLabel(device: string): string {
  return device.trim().toLowerCase();
}

/** True when the tester owns at least one of the selected devices. */
export function testerMatchesDevices(
  testerDevices: string[],
  selectedDevices: string[],
): boolean {
  if (selectedDevices.length === 0) return true;
  const owned = new Set(testerDevices.map(normalizeDeviceLabel));
  return selectedDevices.some((d) => owned.has(normalizeDeviceLabel(d)));
}

/** Merge known device options with any custom devices saved on QA profiles. */
export function buildDeviceFilterOptions(extraDevices: string[] = []): string[] {
  const known = new Set<string>(QA_DEVICE_FILTER_OPTIONS);
  const out = [...QA_DEVICE_FILTER_OPTIONS];
  for (const d of extraDevices) {
    const trimmed = d.trim();
    if (!trimmed || known.has(trimmed)) continue;
    known.add(trimmed);
    out.push(trimmed);
  }
  return out.sort((a, b) => a.localeCompare(b));
}
