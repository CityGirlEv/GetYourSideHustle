import { describe, expect, it } from "vitest";
import {
  GUIDE_HUSTLE_LIBRARY_LISTING_TITLE,
  GUIDE_NOT_FOUND_TITLE,
  guideMatchesLibrarySearch,
  libraryGuideNotFoundCopy,
  librarySidebarCountText,
  SIDE_HUSTLE_LIBRARY_ADMIN_TITLE,
  SIDE_HUSTLE_LIBRARY_TITLE,
  sideHustleLibraryPageTitle,
  textMatchesWildcardQuery,
  wildcardPatternToRegExp,
} from "../guide-library-search";

describe("sideHustleLibraryPageTitle", () => {
  it("keeps Side Hustle Library for members", () => {
    expect(sideHustleLibraryPageTitle({ isAdmin: false })).toBe(SIDE_HUSTLE_LIBRARY_TITLE);
    expect(sideHustleLibraryPageTitle({ isAdmin: false, isDetail: true })).toBe(
      SIDE_HUSTLE_LIBRARY_TITLE,
    );
  });

  it("uses Guide Hustle Library Listing Page for admin listing", () => {
    expect(sideHustleLibraryPageTitle({ isAdmin: true })).toBe(GUIDE_HUSTLE_LIBRARY_LISTING_TITLE);
  });

  it("uses Side Hustle Library Admin for admin status/detail", () => {
    expect(sideHustleLibraryPageTitle({ isAdmin: true, isDetail: true })).toBe(
      SIDE_HUSTLE_LIBRARY_ADMIN_TITLE,
    );
  });
});

describe("textMatchesWildcardQuery", () => {
  it("matches empty query to everything", () => {
    expect(textMatchesWildcardQuery("Handyman", "")).toBe(true);
  });

  it("uses substring when there are no wildcards", () => {
    expect(textMatchesWildcardQuery("Mobile Handyman Services", "handyman")).toBe(true);
    expect(textMatchesWildcardQuery("Mobile Handyman Services", "HANDY")).toBe(true);
    expect(textMatchesWildcardQuery("Mobile Handyman Services", "dog walk")).toBe(false);
  });

  it("supports * and ? wildcards", () => {
    expect(textMatchesWildcardQuery("handyman", "handy*")).toBe(true);
    expect(textMatchesWildcardQuery("handyman", "h?ndyman")).toBe(true);
    expect(textMatchesWildcardQuery("handyman", "handy?")).toBe(false);
    expect(textMatchesWildcardQuery("ai-agents", "ai-*")).toBe(true);
  });
});

describe("guideMatchesLibrarySearch", () => {
  const guide = {
    id: "handyman",
    name: "Handyman / Odd Jobs",
    peek: "Local repairs and punch lists",
    guideNumber: "012",
  };

  it("matches id, name, peek, or guide number", () => {
    expect(guideMatchesLibrarySearch(guide, "handyman")).toBe(true);
    expect(guideMatchesLibrarySearch(guide, "odd jobs")).toBe(true);
    expect(guideMatchesLibrarySearch(guide, "punch")).toBe(true);
    expect(guideMatchesLibrarySearch(guide, "012")).toBe(true);
    expect(guideMatchesLibrarySearch(guide, "rideshare")).toBe(false);
  });

  it("matches wildcard against a single field", () => {
    expect(guideMatchesLibrarySearch(guide, "handy*")).toBe(true);
    expect(guideMatchesLibrarySearch(guide, "*Odd*")).toBe(true);
    expect(guideMatchesLibrarySearch(guide, "0?2")).toBe(true);
    expect(guideMatchesLibrarySearch(guide, "ride*")).toBe(false);
  });
});

describe("wildcardPatternToRegExp", () => {
  it("escapes regex metacharacters", () => {
    expect(wildcardPatternToRegExp("a+b").test("a+b")).toBe(true);
    expect(wildcardPatternToRegExp("a+b").test("aab")).toBe(false);
  });
});

describe("library empty-search copy", () => {
  it("keeps 0 matching on the sidebar and names the miss on the guide label", () => {
    expect(
      librarySidebarCountText({ count: 0, narrowed: true, searchQuery: "zzz-no-guide" }),
    ).toBe("0 matching — guide not found");
    expect(libraryGuideNotFoundCopy("zzz-no-guide")).toEqual({
      title: GUIDE_NOT_FOUND_TITLE,
      lede: "No guide matches “zzz-no-guide”. Try a different name or number, * or ? wildcards, or clear search.",
    });
  });

  it("does not say guide not found when the full library is showing", () => {
    expect(librarySidebarCountText({ count: 117, narrowed: false })).toBe("117");
    expect(librarySidebarCountText({ count: 12, narrowed: true })).toBe("12 matching");
  });

  it("uses a filter-empty title when the list is empty without a search query", () => {
    expect(libraryGuideNotFoundCopy("").title).toBe("No guides match this filter");
    expect(librarySidebarCountText({ count: 0, narrowed: true, searchQuery: "" })).toBe(
      "0 matching",
    );
  });
});
