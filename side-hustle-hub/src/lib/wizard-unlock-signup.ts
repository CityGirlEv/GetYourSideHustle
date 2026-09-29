/**
 * Match Wizard “Unlock Blueprint” always opens Free membership signup
 * (full account fields), not the plans-only Join page.
 */

import type { BlueprintAgeGroup } from "./gysh-analytics";
import { audienceFromAgeGroup } from "./join-audience";
import type { AudienceGroup, TierId } from "./membership";

export function wizardUnlockSignupTarget(ageGroup: BlueprintAgeGroup): {
  tier: TierId;
  audience: AudienceGroup;
} {
  return { tier: "free", audience: audienceFromAgeGroup(ageGroup) };
}
