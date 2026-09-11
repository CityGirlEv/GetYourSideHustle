import { describe, expect, it } from "vitest";
import {
  GUIDE_HUSTLE_LIBRARY_LISTING_TITLE,
  guideMatchesLibrarySearch,
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
