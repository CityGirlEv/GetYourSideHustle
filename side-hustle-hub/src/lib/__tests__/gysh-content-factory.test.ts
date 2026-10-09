import { describe, expect, it } from "vitest";
import { seedSoftLaunchDrafts } from "../gysh-content-factory";
import {
  SOFT_LAUNCH_FACTORY_MAX_SPRINT,
  SOFT_LAUNCH_FACTORY_MIN_SPRINT,
  SOFT_LAUNCH_ROLLOUT,
  SOFT_LAUNCH_SEED_ALL_RANGE,
  rolloutItemToDraftFields,
} from "../gysh-soft-launch-rollout";

describe("seedSoftLaunchDrafts", () => {
  it("seeds the full marketing calendar (S2–S14), not only S2–S5", () => {
    expect(SOFT_LAUNCH_SEED_ALL_RANGE).toBe("S2–S14");
    const later = SOFT_LAUNCH_ROLLOUT.filter((i) => i.sprint >= 6 && i.sprint <= 14);
    expect(later.length).toBeGreaterThan(0);

    const result = seedSoftLaunchDrafts({ batches: [], drafts: [] });
    expect(result.added).toBe(SOFT_LAUNCH_ROLLOUT.length);
    expect(result.batches[0]?.name).toBe(`Soft Launch — ${SOFT_LAUNCH_SEED_ALL_RANGE}`);
    for (const sprint of [6, 7, 8, 9, 10, 11, 12, 13, 14]) {
      const item = SOFT_LAUNCH_ROLLOUT.find((i) => i.sprint === sprint);
      expect(item).toBeTruthy();
      expect(result.drafts.some((d) => d.title === rolloutItemToDraftFields(item!).title)).toBe(true);
    }
    expect(
      result.drafts.every((d) => {
        const item = SOFT_LAUNCH_ROLLOUT.find((i) => d.title === rolloutItemToDraftFields(i).title);
        return (
          item != null &&
          item.sprint >= SOFT_LAUNCH_FACTORY_MIN_SPRINT &&
          item.sprint <= SOFT_LAUNCH_FACTORY_MAX_SPRINT
        );
      }),
    ).toBe(true);
  });

  it("adds only missing later-sprint drafts when S2–S5 are already seeded", () => {
    const early = SOFT_LAUNCH_ROLLOUT.filter((i) => i.sprint >= 2 && i.sprint <= 5);
    const existing = seedSoftLaunchDrafts({ batches: [], drafts: [] }, { items: early });
    expect(existing.added).toBe(early.length);

    const rest = seedSoftLaunchDrafts({ batches: existing.batches, drafts: existing.drafts });
    const later = SOFT_LAUNCH_ROLLOUT.filter((i) => i.sprint >= 6 && i.sprint <= 14);
    expect(rest.added).toBe(later.length);
    expect(rest.drafts).toHaveLength(SOFT_LAUNCH_ROLLOUT.length);
  });
});
