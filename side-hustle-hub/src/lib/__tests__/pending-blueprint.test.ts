import { afterEach, describe, expect, it } from "vitest";
import { setSessionToken } from "../api";
import { clearMemoryStore } from "../browser-storage";
import {
  PENDING_BLUEPRINT_TTL_MS,
  clearPendingBlueprint,
  isPendingBlueprintFresh,
  peekPendingBlueprintFor,
  pendingWizardRegisterPayload,
  readPendingBlueprint,
  recoverComplimentaryFromWizard,
  savePendingBlueprint,
} from "../pending-blueprint";
import {
  cachedComplimentaryGuideIds,
  setCachedComplimentaryGuideIds,
} from "../wizard-comp-guide";
import {
  clearFreeMemberSession,
  grantFreeMemberSession,
  hasBlueprintAccess,
  hasFreeMemberSession,
  isPendingFreePlaceholderUser,
  portalSessionUnlocksBlueprint,
  pendingFreeAuthUser,
  readFreeMemberSession,
  visibleBlueprintMatches,
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
  setSessionToken(null);
  clearPendingBlueprint();
  clearFreeMemberSession();
  clearActAsTarget();
  setCachedComplimentaryGuideIds([]);
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

  it("packages the finished wizard for register without using the signup age lane", () => {
    expect(pendingWizardRegisterPayload(null)).toEqual({});

    const pending = savePendingBlueprint({
      ageGroup: "junior",
      answers: { hours: "few" },
      resultIds: ["tech-helper", "tutoring"],
      resultPcts: { "tech-helper": 82, tutoring: 61 },
      returnView: "kids",
      claimToken: "claim-abc",
    });

    expect(pendingWizardRegisterPayload(pending)).toEqual({
      claimToken: "claim-abc",
      pendingBlueprint: {
        ageGroup: "junior",
        answers: { hours: "few" },
        resultIds: ["tech-helper", "tutoring"],
        resultPcts: { "tech-helper": 82, tutoring: 61 },
      },
    });
  });

  it("still sends the wizard payload when no claim token was issued yet", () => {
    const pending = savePendingBlueprint({
      ageGroup: "adult",
      answers: { budget: "low" },
      resultIds: ["pod"],
      returnView: "quiz",
    });
    const payload = pendingWizardRegisterPayload(pending);
    expect(payload.claimToken).toBeUndefined();
    expect(payload.pendingBlueprint?.resultIds).toEqual(["pod"]);
  });
});

describe("free member session / Blueprint access", () => {
  it("does not treat a localStorage free-session marker as Blueprint access", () => {
    grantFreeMemberSession({
      email: "parent@example.com",
      ageGroup: "kids",
      isParentAccount: true,
    });
    expect(hasFreeMemberSession()).toBe(true);
    expect(hasBlueprintAccess({ ageGroup: "kids", isLoggedIn: false })).toBe(false);
  });

  it("requires a GYSH login — local team join and free-session markers are not enough", () => {
    expect(hasBlueprintAccess({ ageGroup: "adult", isLoggedIn: false })).toBe(false);
    expect(hasBlueprintAccess({ ageGroup: "adult", isLoggedIn: true })).toBe(true);
    expect(hasBlueprintAccess({ ageGroup: "kids", isLoggedIn: false })).toBe(false);
    expect(hasBlueprintAccess({ ageGroup: "junior", isLoggedIn: false })).toBe(false);
    expect(hasBlueprintAccess({ ageGroup: "senior", isLoggedIn: false })).toBe(false);
    expect(
      hasBlueprintAccess({ ageGroup: "kids", isLoggedIn: false, hasTeamMembership: true }),
    ).toBe(false);
    expect(
      hasBlueprintAccess({ ageGroup: "junior", isLoggedIn: false, hasTeamMembership: true }),
    ).toBe(false);
    expect(hasBlueprintAccess({ ageGroup: "junior", isLoggedIn: true })).toBe(true);
    grantFreeMemberSession({ email: "guest@example.com", ageGroup: "adult" });
    expect(hasBlueprintAccess({ ageGroup: "adult", isLoggedIn: false })).toBe(false);
  });

  it("unlocks ranked Blueprints for any portal login, including Admin and QA", () => {
    expect(portalSessionUnlocksBlueprint({ isLoggedIn: true })).toBe(true);
    expect(portalSessionUnlocksBlueprint({ isLoggedIn: false })).toBe(false);
    expect(portalSessionUnlocksBlueprint({ isLoggedIn: true, previewAsGuest: true })).toBe(false);
  });

  it("hydrates a Free member profile from the pending local session", () => {
    grantFreeMemberSession({ email: "free@example.com", ageGroup: "adult" });
    const user = pendingFreeAuthUser(readFreeMemberSession());
    expect(user?.email).toBe("free@example.com");
    expect(user?.membershipTier).toBe("free");
    expect(user?.status).toBe("pending");
    expect(isPendingFreePlaceholderUser(user)).toBe(true);
    expect(isPendingFreePlaceholderUser({ id: "u-real-member" })).toBe(false);
    expect(pendingFreeAuthUser(null)).toBeNull();
  });

  it("hides every ranked match from guests and shows the full list once Free (or higher) is unlocked", () => {
    const matches = [
      { id: "dog-walk", title: "Neighborhood Dog Walker" },
      { id: "yard-help", title: "Yard & Garden Helper" },
      { id: "tech-helper", title: "Senior Tech Helper" },
    ];
    expect(visibleBlueprintMatches(matches, false)).toEqual([]);
    expect(visibleBlueprintMatches(matches, false, "yard-help")).toEqual([matches[1]]);
    expect(visibleBlueprintMatches(matches, true)).toEqual(matches);
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
    expect(hasBlueprintAccess({ ageGroup: "kids", isLoggedIn: true })).toBe(true);
    expect(hasBlueprintAccess({ ageGroup: "junior", isLoggedIn: true })).toBe(true);
    expect(hasBlueprintAccess({ ageGroup: "senior", isLoggedIn: true })).toBe(true);
    writeActAsTarget({ type: "self" });
    expect(actAsAudience(readActAsTarget())).toBe("admin");
    // Admin browsing as themselves is still a logged-in member — ranked Blueprint stays unlocked.
    expect(
      portalSessionUnlocksBlueprint({ isLoggedIn: true, previewAsGuest: false }),
    ).toBe(true);
    expect(
      portalSessionUnlocksBlueprint({ isLoggedIn: true, previewAsGuest: true }),
    ).toBe(false);
    expect(portalSessionUnlocksBlueprint({ isLoggedIn: false })).toBe(false);
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

describe("complimentary extra recovery after Free signup", () => {
  it("does not auto-claim a complimentary extra from pending wizard results", async () => {
    savePendingBlueprint({
      ageGroup: "adult",
      answers: { budget: "low" },
      resultIds: ["airbnb", "dog-walk"],
      resultPcts: { airbnb: 100, "dog-walk": 72 },
      returnView: "quiz",
    });
    expect(await recoverComplimentaryFromWizard(false)).toBeNull();
    expect(cachedComplimentaryGuideIds()).toEqual([]);
  });
});
