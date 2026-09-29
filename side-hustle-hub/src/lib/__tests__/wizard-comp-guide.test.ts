import { afterEach, describe, expect, it } from "vitest";
import { setSessionToken } from "../api";
import { clearMemoryStore } from "../browser-storage";
import { isFreeWizardHustle } from "../side-hustle-catalog";
import {
  claimComplimentaryGuide,
  claimedExtraGuideId,
  complimentaryGuideIds,
  complimentaryPickNotice,
  complimentarySelectionError,
  ensureComplimentaryClaim,
  explicitComplimentaryGuideId,
  mergeCompMaps,
  pickComplimentaryExtraGuideId,
  readLocalComplimentaryExtraId,
  setCachedComplimentaryGuideIds,
} from "../wizard-comp-guide";

afterEach(() => {
  setSessionToken(null);
  setCachedComplimentaryGuideIds([]);
  clearMemoryStore();
});

describe("wizard complimentary extra guide", () => {
  it("picks the true 100% match even when it is Unique Unique Free", () => {
    expect(isFreeWizardHustle("dog-walk")).toBe(true);
    expect(isFreeWizardHustle("airbnb")).toBe(false);
    expect(
      pickComplimentaryExtraGuideId({
        resultIds: ["dog-walk", "yard-help", "airbnb"],
        resultPcts: { "dog-walk": 100, "yard-help": 80, airbnb: 70 },
      }),
    ).toBe("dog-walk");
  });

  it("picks the highest % paid match when that is the true top", () => {
    expect(
      pickComplimentaryExtraGuideId({
        resultIds: ["airbnb", "tutoring", "dog-walk"],
        resultPcts: { airbnb: 100, tutoring: 88, "dog-walk": 40 },
      }),
    ).toBe("airbnb");
  });

  it("falls back to the first result id when percents are missing", () => {
    expect(
      pickComplimentaryExtraGuideId({
        resultIds: ["tutoring", "dog-walk"],
      }),
    ).toBe("tutoring");
  });

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

  it("does not treat a leftover auto extra as the complimentary pick", () => {
    const leftover = { extra: "tutoring" };
    expect(explicitComplimentaryGuideId(leftover)).toBeNull();
    expect(complimentaryGuideIds(leftover)).toEqual([]);
    expect(mergeCompMaps(leftover, { adult: "airbnb" })).toEqual({});

    const picked = claimComplimentaryGuide(leftover, "consulting");
    expect(picked.alreadyClaimed).toBe(false);
    expect(picked.claimedId).toBe("consulting");
    expect(picked.next).toEqual({ extra: "consulting", source: "pick" });
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
});
