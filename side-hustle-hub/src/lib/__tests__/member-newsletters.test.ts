import { describe, expect, it } from "vitest";
import { parseAppRoute, pathForView, titleForView } from "../app-routes";
import {
  NEWSLETTER_CADENCE,
  NEWSLETTER_CADENCE_LABEL,
  memberNewsletterBody,
  mergeMemberNewsletterIssues,
  normalizeNewsletterTitle,
  publishedDraftsToIssues,
  softLaunchNewsletterIssues,
  teaserIssues,
} from "../member-newsletters";

describe("member newsletters", () => {
  it("routes /newsletter and /newsletters", () => {
    expect(parseAppRoute("/newsletter")).toEqual({ view: "newsletter", guidesManualId: null });
    expect(parseAppRoute("/newsletters")).toEqual({ view: "newsletter", guidesManualId: null });
    expect(pathForView("newsletter")).toBe("/newsletter");
    expect(titleForView("newsletter")).toMatch(/Newsletter/);
  });

  it("uses a weekly Friday cadence", () => {
    expect(NEWSLETTER_CADENCE).toBe("weekly");
    expect(NEWSLETTER_CADENCE_LABEL).toBe("Weekly Newsletter");
  });

  it("builds soft-launch archive issues with readable copy", () => {
    const issues = softLaunchNewsletterIssues();
    expect(issues.length).toBeGreaterThanOrEqual(3);
    expect(issues.map((i) => i.title)).toEqual(
      expect.arrayContaining([
        "Newsletter #1 — Soft launch welcome",
        "Newsletter #2 — One hustle, 30 days",
        "Newsletter #3 — Workshops teaser + guides",
      ]),
    );
    for (const issue of issues) {
      expect(issue.body).toMatch(/getyoursidehustle\.com/i);
      expect(issue.body).not.toMatch(/--- ARTIFACTS/);
    }
  });

  it("strips Content Factory admin appendix from published bodies", () => {
    expect(memberNewsletterBody("Hello family.\n\n--- ARTIFACTS ---\n1. Send log")).toBe("Hello family.");
  });

  it("merges published drafts over matching soft-launch titles", () => {
    const published = publishedDraftsToIssues([
      {
        id: "D-1",
        type: "newsletter",
        status: "published",
        title: "[S3] Newsletter #1 — Soft launch welcome",
        excerpt: "Live send",
        body: "Updated welcome copy\n\n--- ARTIFACTS ---\npreview",
        createdAt: "2026-08-21T14:00:00.000Z",
        audience: "all",
      },
      {
        id: "D-skip",
        type: "facebook_post",
        status: "published",
        title: "Not a newsletter",
        body: "nope",
      },
    ]);
    expect(published).toHaveLength(1);
    expect(published[0]?.body).toBe("Updated welcome copy");

    const merged = mergeMemberNewsletterIssues(published);
    expect(merged.some((i) => i.id === "D-1")).toBe(true);
    expect(merged.some((i) => i.id === "sl-s4-newsletter-2")).toBe(true);
    expect(merged.filter((i) => normalizeNewsletterTitle(i.title).includes("soft launch welcome"))).toHaveLength(1);
  });

  it("hides body on teasers for locked visitors", () => {
    const teasers = teaserIssues(softLaunchNewsletterIssues());
    expect(teasers.length).toBeGreaterThan(0);
    expect(teasers[0]).not.toHaveProperty("body");
  });
});
