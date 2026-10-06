import { afterEach, describe, expect, it } from "vitest";
import { setSessionToken } from "../api";
import { clearMemoryStore } from "../browser-storage";
import {
  clearAccountActivationPending,
  clearFreeMemberSession,
  grantFreeMemberSession,
} from "../free-member-session";
import {
  ACCOUNT_ACTIVATION_REQUIRED_ERROR,
  claimComplimentaryGuide,
  claimSelectedComplimentaryGuide,
  claimedExtraGuideId,
  complimentaryGuideIds,
  complimentaryPickNotice,
  complimentaryUnlockButtonLabel,
  complimentarySelectionError,
  ensureComplimentaryClaim,
  explicitComplimentaryGuideId,
  freeGuideCardLine,
  freeGuideSelectionBlock,
  mergeCompMaps,
  readLocalComplimentaryExtraId,
  resolveStoredComplimentaryPick,
  selectGuestFreeGuide,
  setCachedComplimentaryGuideIds,
  storedComplimentaryPayload,
  canOfferComplimentaryPick,
} from "../wizard-comp-guide";

afterEach(() => {
  setSessionToken(null);
  setCachedComplimentaryGuideIds([]);
  clearFreeMemberSession();
  clearMemoryStore();
});

describe("wizard complimentary extra guide", () => {
  it("claims one extra per account and ignores later wizards", () => {
    const first = claimComplimentaryGuide({}, "airbnb");
    expect(first.alreadyClaimed).toBe(false);
    expect(first.claimedId).toBe("airbnb");
    expect(first.next.source).toBe("pick");
    expect(complimentaryGuideIds(first.next)).toEqual(["airbnb"]);

    const second = claimComplimentaryGuide(first.next, "tutoring");
    expect(second.alreadyClaimed).toBe(true);
    expect(second.claimedId).toBe("airbnb");
    expect(claimedExtraGuideId(second.next)).toBe("airbnb");
  });

  it("stores a free guide only after Select this as my free guide", () => {
    const untouched = { extra: "tutoring" };
    expect(explicitComplimentaryGuideId(untouched)).toBeNull();
    expect(complimentaryGuideIds(untouched)).toEqual([]);
    expect(mergeCompMaps(untouched, { adult: "airbnb" })).toEqual({});
    expect(storedComplimentaryPayload(untouched)).toEqual({});
    expect(freeGuideCardLine("")).toBe("Free guide: not picked yet");
    expect(
      canOfferComplimentaryPick({
        isLoggedIn: true,
        membershipTier: "free",
        claimedId: explicitComplimentaryGuideId(untouched),
      }),
    ).toBe(true);

    const picked = claimComplimentaryGuide(untouched, "consulting");
    expect(picked.alreadyClaimed).toBe(false);
    expect(picked.claimedId).toBe("consulting");
    expect(picked.next).toEqual({ extra: "consulting", source: "pick" });
    expect(explicitComplimentaryGuideId(picked.next)).toBe("consulting");
    expect(storedComplimentaryPayload(picked.next)).toEqual({ extra: "consulting", source: "pick" });
    expect(freeGuideCardLine("Consulting")).toBe("Free guide: Consulting");
    expect(
      canOfferComplimentaryPick({
        isLoggedIn: true,
        membershipTier: "free",
        claimedId: explicitComplimentaryGuideId(picked.next),
      }),
    ).toBe(false);

    const again = claimComplimentaryGuide(picked.next, "airbnb");
    expect(again.alreadyClaimed).toBe(true);
    expect(again.claimedId).toBe("consulting");
  });

  it("keeps the first explicit pick when merging local and server maps", () => {
    const merged = mergeCompMaps(
      { extra: "airbnb", source: "pick" },
      { extra: "tutoring", source: "pick", adult: "pod" },
    );
    expect(explicitComplimentaryGuideId(merged)).toBe("airbnb");
  });

  it("does not auto-claim a complimentary extra from wizard results", async () => {
    const guest = await ensureComplimentaryClaim({
      isLoggedIn: false,
      resultIds: ["airbnb", "dog-walk"],
      resultPcts: { airbnb: 100, "dog-walk": 80 },
    });
    expect(guest.claimedId).toBeNull();
    expect(guest.alreadyClaimed).toBe(false);
    expect(readLocalComplimentaryExtraId()).toBeNull();
  });

  it("tells Free members to unlock on the match row", () => {
    expect(complimentaryPickNotice()).toMatch(/Unlock this complimentary guide/i);
    expect(complimentaryUnlockButtonLabel()).toBe("Select this as my free guide");
    expect(complimentaryUnlockButtonLabel(true)).toBe("Unlocking…");
    expect(complimentarySelectionError({ selectedId: "", resultIds: ["airbnb"] })).toMatch(
      /Unlock 1 guide/i,
    );
  });

  it("blocks spending the complimentary unlock on a Unique Unique Free guide", () => {
    expect(
      complimentarySelectionError({
        selectedId: "dog-walk",
        resultIds: ["dog-walk", "airbnb"],
        alreadyOnFree: true,
      }),
    ).toMatch(/already on Unique Unique Free/i);
    expect(
      complimentarySelectionError({
        selectedId: "airbnb",
        resultIds: ["dog-walk", "airbnb"],
        alreadyOnFree: false,
      }),
    ).toBeNull();
  });

  it("tells an unactivated account to use the activation email before selecting a free guide", async () => {
    grantFreeMemberSession({
      email: "new@example.com",
      ageGroup: "adult",
      activationPending: true,
    });
    expect(freeGuideSelectionBlock({ isLoggedIn: false })).toBe(ACCOUNT_ACTIVATION_REQUIRED_ERROR);

    const blocked = selectGuestFreeGuide("airbnb", ["airbnb", "dog-walk"]);
    expect(blocked.error).toBe(ACCOUNT_ACTIVATION_REQUIRED_ERROR);
    expect(blocked.claimedId).toBeNull();
    expect(readLocalComplimentaryExtraId()).toBeNull();

    const memberBlocked = await claimSelectedComplimentaryGuide({
      isLoggedIn: true,
      accountStatus: "pending",
      membershipTier: "free",
      guideId: "airbnb",
      resultIds: ["airbnb"],
    });
    expect(memberBlocked.error).toBe(ACCOUNT_ACTIVATION_REQUIRED_ERROR);
    expect(memberBlocked.claimedId).toBeNull();

    clearAccountActivationPending();
    expect(freeGuideSelectionBlock({ isLoggedIn: false })).toBeNull();
    expect(freeGuideSelectionBlock({ isLoggedIn: true, accountStatus: "active" })).toBeNull();
  });

  it("lets a guest select one free guide and keeps that choice for life", () => {
    const first = selectGuestFreeGuide("airbnb", ["airbnb", "dog-walk"]);
    expect(first.error).toBeNull();
    expect(first.claimedId).toBe("airbnb");
    expect(readLocalComplimentaryExtraId()).toBe("airbnb");

    const second = selectGuestFreeGuide("dog-walk", ["airbnb", "dog-walk"]);
    expect(second.alreadyClaimed).toBe(true);
    expect(second.claimedId).toBe("airbnb");
    expect(second.error).toMatch(/once per lifetime/i);
    expect(readLocalComplimentaryExtraId()).toBe("airbnb");
  });

  it("keeps a saved free-member pick when the server read is still empty", () => {
    expect(resolveStoredComplimentaryPick({}, "airbnb")).toEqual({
      extra: "airbnb",
      source: "pick",
    });
    expect(resolveStoredComplimentaryPick({ extra: "tutoring" }, "airbnb")).toEqual({
      extra: "airbnb",
      source: "pick",
    });
    expect(
      resolveStoredComplimentaryPick({ extra: "tutoring", source: "pick" }, "airbnb"),
    ).toEqual({ extra: "tutoring", source: "pick" });
    expect(resolveStoredComplimentaryPick({ extra: "tutoring" }, null)).toEqual({});
  });

  it("offers the one free guide to every free registration, including a blank tier", () => {
    for (const membershipTier of ["free", "Free", "", null]) {
      expect(
        canOfferComplimentaryPick({ isLoggedIn: true, membershipTier, claimedId: null }),
      ).toBe(true);
    }
    expect(
      canOfferComplimentaryPick({ isLoggedIn: true, membershipTier: "starter" }),
    ).toBe(true);
    expect(
      canOfferComplimentaryPick({ isLoggedIn: false, membershipTier: "free" }),
    ).toBe(false);
    expect(
      canOfferComplimentaryPick({
        isLoggedIn: true,
        membershipTier: "free",
        claimedId: "airbnb",
      }),
    ).toBe(false);
  });
});
