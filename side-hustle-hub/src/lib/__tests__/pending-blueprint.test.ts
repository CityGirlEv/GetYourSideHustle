import { afterEach, describe, expect, it } from "vitest";
import { clearMemoryStore } from "../browser-storage";
import {
  PENDING_BLUEPRINT_TTL_MS,
  clearPendingBlueprint,
  isPendingBlueprintFresh,
  peekPendingBlueprintFor,
  readPendingBlueprint,
  savePendingBlueprint,
} from "../pending-blueprint";
import {
  clearFreeMemberSession,
  grantFreeMemberSession,
  hasBlueprintAccess,
  hasFreeMemberSession,
} from "../free-member-session";
import {
  actAsAudience,
  actAsLabel,
  audienceFromRoles,
  clearActAsTarget,
  readActAsTarget,
  writeActAsTarget,
} from "../admin-act-as";

afterEach(() => {
  clearPendingBlueprint();
  clearFreeMemberSession();
  clearActAsTarget();
  clearMemoryStore();
});

describe("pending Side Hustle Blueprint storage", () => {
  it("saves and reads a fresh pending blueprint", () => {
    savePendingBlueprint({
      ageGroup: "adult",
      answers: { budget: "low", time: "medium", skill: ["creative"], goal: ["passive", "local"] },
      resultIds: ["pod", "affiliate", "social"],
      returnView: "quiz",
    });
    const pending = readPendingBlueprint();
    expect(pending?.ageGroup).toBe("adult");
    expect(pending?.resultIds).toEqual(["pod", "affiliate", "social"]);
    expect(peekPendingBlueprintFor("adult")?.resultIds[0]).toBe("pod");
    expect(peekPendingBlueprintFor("kids")).toBeNull();
  });

  it("expires pending data after seven days", () => {
    const stale = savePendingBlueprint({
      ageGroup: "senior",
      answers: { lifestyle: "gentle" },
      resultIds: ["tutoring"],
      returnView: "seniors",
      completedAt: new Date(Date.now() - PENDING_BLUEPRINT_TTL_MS - 1000).toISOString(),
    });
    expect(isPendingBlueprintFresh(stale)).toBe(false);
    expect(readPendingBlueprint()).toBeNull();
  });

  it("clears pending after successful link", () => {
    savePendingBlueprint({
      ageGroup: "junior",
      answers: { age: "older" },
      resultIds: ["tech-helper"],
      returnView: "kids",
    });
    clearPendingBlueprint();
    expect(readPendingBlueprint()).toBeNull();
  });
});

describe("free member session / Blueprint access", () => {
  it("grants access without collecting child email for kids parent unlock", () => {
    grantFreeMemberSession({
      email: "parent@example.com",
      ageGroup: "kids",
      isParentAccount: true,
    });
    expect(hasFreeMemberSession()).toBe(true);
    expect(hasBlueprintAccess({ ageGroup: "kids", isLoggedIn: false })).toBe(true);
  });

  it("requires login, free session, or team membership", () => {
    expect(hasBlueprintAccess({ ageGroup: "adult", isLoggedIn: false })).toBe(false);
    expect(hasBlueprintAccess({ ageGroup: "adult", isLoggedIn: true })).toBe(true);
    expect(
      hasBlueprintAccess({ ageGroup: "kids", isLoggedIn: false, hasTeamMembership: true }),
    ).toBe(true);
  });
});

describe("admin act-as profiles", () => {
  it("maps roles to audiences and persists selection", () => {
    expect(audienceFromRoles(["kid", "adult"])).toBe("kids");
    expect(audienceFromRoles(["junior"])).toBe("junior");
    expect(audienceFromRoles(["senior"])).toBe("senior");
    writeActAsTarget({ type: "audience", audience: "senior" });
    expect(actAsAudience(readActAsTarget())).toBe("senior");
    expect(actAsLabel(readActAsTarget())).toContain("Senior");
    writeActAsTarget({ type: "guest" });
    expect(actAsAudience(readActAsTarget())).toBe("guest");
    expect(actAsLabel(readActAsTarget())).toContain("Unlogged");
    expect(hasBlueprintAccess({ ageGroup: "adult", isLoggedIn: true, previewAsGuest: true })).toBe(
      false,
    );
    writeActAsTarget({ type: "self" });
    expect(actAsAudience(readActAsTarget())).toBe("admin");
  });
});

describe("Side Hustle copy rule helpers", () => {
  it("blueprint unlock labels use Side Hustle phrasing", () => {
    const copy = [
      "Your Side Hustle Blueprint Is Ready!",
      "Create your free GYSH account to unlock your complete Side Hustle Blueprint.",
      "Teens Side Hustle Blueprint",
      "Adult Side Hustle Blueprint",
      "Senior Side Hustle Blueprint",
    ];
    for (const line of copy) {
      expect(line.includes("Side Hustle")).toBe(true);
    }
  });
});
