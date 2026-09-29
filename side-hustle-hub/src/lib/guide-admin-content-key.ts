import type { GuideKit } from "./guide-tools";

/** Stable fingerprint so parent re-creating `kit` objects does not wipe in-progress edits. */
export function guideAdminKitContentKey(
  guideId: string,
  name: string,
  kit: GuideKit,
): string {
  return JSON.stringify({
    guideId,
    name: name.trim(),
    steps: kit.steps ?? [],
    prerequisites: kit.prerequisites ?? [],
    tools: kit.tools ?? [],
    supplies: kit.supplies ?? null,
    suggestedPricing: kit.suggestedPricing ?? null,
  });
}
