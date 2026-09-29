import { describe, expect, it } from "vitest";
import {
  CREDIT_EARN_ACTIONS,
  CREDIT_PACKS,
  creditPackById,
  isCreditPackId,
  ALA_CARTE_PRICE_LIST,
  MEMBER_PERKS_BY_TIER,
  MEMBERSHIP_COMPARE_ROWS,
  MEMBERSHIP_FEATURES,
  MEMBERSHIP_TIERS,
  MILITARY_VETERAN_CALLOUT,
  SHOW_MILITARY_VETERAN_CALLOUT,
  SCHEDULE_SUITE_FEATURE_IDS,
  SCHEDULE_SUITE_TIER,
  YEARLY_MONTHS_CHARGED,
  canAccessNewsletter,
  canAccessCommunity,
  canAccessMemberGuides,
  isMembershipSubscriber,
  nextTierId,
  numberedTierPerks,
  previousTierId,
  tierHasFeature,
  tierKidCredits,
  kidCreditsFeatureLabel,
  oneOnOneFeatureLabel,
  oneOnOneSessionCount,
  tierPriceMonthlyUsd,
  tierPriceYearlyUsd,
  yearlySavingsUsd,
  yearlySavingsPercent,
  equivalentMonthlyUsd,
  formatAlaCarteDetails,
  formatCreditEarnLimit,
  formatEarnCreditDelta,
  formatMerchChoiceNote,
  merchChoicesError,
  merchItemCount,
  memberNeedsMerchChoice,
  merchChoiceSummaryFromNotes,
  mergeMerchNote,
  notesHaveMerchChoice,
  parseMerchChoices,
} from "../membership";

describe("membership catalog", () => {
  it("defines Free, Starter, Pro, and Elite", () => {
    expect(MEMBERSHIP_TIERS.map((t) => t.id)).toEqual(["free", "starter", "pro", "elite"]);
  });

  it("walks the plan ladder for switch and upgrade", () => {
    expect(previousTierId("pro")).toBe("starter");
    expect(nextTierId("starter")).toBe("pro");
    expect(nextTierId("elite")).toBeNull();
    expect(isMembershipSubscriber("free")).toBe(false);
    expect(isMembershipSubscriber("starter")).toBe(true);
  });

  it("unlocks the bi-weekly newsletter at Starter", () => {
    expect(canAccessNewsletter("free")).toBe(false);
    expect(canAccessNewsletter("starter")).toBe(true);
    expect(canAccessNewsletter("pro")).toBe(true);
    expect(canAccessNewsletter("elite")).toBe(true);
    expect(canAccessNewsletter("free", { isAdmin: true })).toBe(true);
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      expect(MEMBER_PERKS_BY_TIER.starter[audience].some((p) => /bi-weekly newsletter/i.test(p.title))).toBe(
        true,
      );
    }
  });

  it("unlocks community and paid member guides at Starter, not Free", () => {
    expect(canAccessCommunity("free")).toBe(false);
    expect(canAccessCommunity("starter")).toBe(true);
    expect(canAccessCommunity("free", { isAdmin: true })).toBe(true);
    expect(canAccessMemberGuides("free")).toBe(false);
    expect(canAccessMemberGuides("starter")).toBe(true);
    expect(canAccessMemberGuides("pro")).toBe(true);
  });

  it("unlocks the schedule suite at Pro", () => {
    expect(SCHEDULE_SUITE_TIER).toBe("pro");
    for (const featureId of SCHEDULE_SUITE_FEATURE_IDS) {
      expect(tierHasFeature("free", featureId)).toBe(false);
      expect(tierHasFeature("starter", featureId)).toBe(false);
      expect(tierHasFeature("pro", featureId)).toBe(true);
      expect(tierHasFeature("elite", featureId)).toBe(true);
    }
  });

  it("lists credit earn actions for Kids and Teens", () => {
    const kids = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes("kids"));
    const juniors = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes("junior"));
    expect(kids.length).toBeGreaterThan(3);
    expect(juniors.length).toBeGreaterThan(3);
  });

  it("prices credit packs at $1 per Kid Credit", () => {
    expect(CREDIT_PACKS.map((pack) => pack.credits)).toEqual([5, 10, 20, 40]);
    expect(CREDIT_PACKS.map((pack) => pack.priceUsd)).toEqual([5, 10, 20, 40]);
    for (const pack of CREDIT_PACKS) {
      expect(pack.priceUsd).toBe(pack.credits);
    }
    expect(isCreditPackId("boost")).toBe(true);
    expect(creditPackById("boost")?.credits).toBe(5);
    expect(creditPackById("family")?.priceUsd).toBe(40);
    expect(isCreditPackId("consult-30")).toBe(false);
  });

  it("includes monthly credits on paid membership packages only", () => {
    expect(tierKidCredits("free")).toBe(0);
    expect(tierKidCredits("starter")).toBe(2.5);
    expect(tierKidCredits("pro")).toBe(5);
    expect(tierKidCredits("elite")).toBe(10);
  });

  it("labels included credits without converting to adult credits", () => {
    expect(kidCreditsFeatureLabel("starter")).toBe("2.5 credits");
    expect(kidCreditsFeatureLabel("pro")).toBe("5 credits");
    expect(kidCreditsFeatureLabel("elite")).toBe("10 credits");
  });

  it("lists a-la-carte cost as dollars or the same number of credits", () => {
    expect(
      formatAlaCarteDetails({
        priceUsd: 15,
        credits: 15,
        includedIn: ["starter", "pro", "elite"],
      }),
    ).toBe("$15 or 15 credits");
    expect(formatAlaCarteDetails({ priceUsd: 75, credits: 150 })).toBe("$75 or 75 credits");
    expect(formatAlaCarteDetails({ priceUsd: 1, credits: 1 })).toBe("$1 or 1 credit");
    expect(formatAlaCarteDetails({ priceUsd: 15, credits: 20, includedIn: ["starter"] })).not.toMatch(
      /kid|adult|Starter/i,
    );
  });

  it("requires a 5-student minimum for Story Time and does not sell a custom schedule build", () => {
    const story = ALA_CARTE_PRICE_LIST.find((item) => item.id === "story-time");
    expect(story?.name).toMatch(/5 students needed to hold a class/i);
    expect(story?.detail).toMatch(/5 students needed to hold a class/i);
    expect(story?.detail).toMatch(/parent nearby/i);
    expect(story?.explain).toMatch(/Five students are needed to hold a class/i);
    expect(ALA_CARTE_PRICE_LIST.some((item) => item.id === "custom-schedule")).toBe(false);
    expect(ALA_CARTE_PRICE_LIST.some((item) => item.id === "parent-brief")).toBe(false);
    const workshops = ALA_CARTE_PRICE_LIST.find((item) => item.id === "workshop-general");
    expect(workshops?.name).toBe("Workshops (Starter & Above Workshops Free)");
    expect(workshops?.priceUsd).toBe(40);
    expect(workshops?.credits).toBe(40);
    expect(workshops?.includedIn).toEqual(["starter", "pro", "elite"]);
    expect(workshops?.audiences).toEqual(["kids", "junior", "adult", "senior"]);
    const progress = ALA_CARTE_PRICE_LIST.find((item) => item.id === "progress-pdf");
    expect(progress?.detail).toMatch(/scorecard of hustle progress/i);
    expect(ALA_CARTE_PRICE_LIST.find((item) => item.id === "consult-30")).toMatchObject({
      priceUsd: 45,
      credits: 45,
      includedIn: ["starter"],
    });
    expect(ALA_CARTE_PRICE_LIST.find((item) => item.id === "consult-60")).toMatchObject({
      priceUsd: 65,
      credits: 65,
      includedIn: ["starter", "pro", "elite"],
    });
    expect(ALA_CARTE_PRICE_LIST.find((item) => item.id === "consult-90")).toMatchObject({
      priceUsd: 75,
      credits: 75,
      includedIn: [],
    });
    expect(ALA_CARTE_PRICE_LIST.find((item) => item.id === "consult-120")).toMatchObject({
      priceUsd: 145,
      credits: 145,
      includedIn: [],
    });
  });

  it("lists referral earn actions for every audience", () => {
    const referral = CREDIT_EARN_ACTIONS.find((a) => a.id === "refer_friend");
    expect(referral?.credits).toBe(5);
    expect(CREDIT_EARN_ACTIONS.find((a) => a.id === "launch_hustle")?.credits).toBe(2);
    const kidsIds = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes("kids")).map((a) => a.id);
    expect(kidsIds).not.toContain("workshop_attend");
    expect(kidsIds).not.toContain("story_attend");
    expect(kidsIds).not.toContain("income_25");
    expect(kidsIds).not.toContain("piggy_goal");
    expect(CREDIT_EARN_ACTIONS.find((a) => a.id === "parent_plan")?.credits).toBe(5);
    expect(referral?.audiences).toEqual(expect.arrayContaining(["kids", "junior", "adult", "senior"]));
  });

  it("drops crossed-off earn actions from Ways to Earn", () => {
    const ids = CREDIT_EARN_ACTIONS.map((a) => a.id);
    expect(ids).not.toContain("quiz_complete");
    expect(ids).not.toContain("workshop_attend");
    expect(ids).not.toContain("one_on_one_prep");
    expect(ids).not.toContain("weekly_checkin");
  });

  it("pays 1 credit for finishing a member guide once per week", () => {
    const guide = CREDIT_EARN_ACTIONS.find((a) => a.id === "guide_complete");
    expect(guide?.credits).toBe(1);
    expect(guide?.audiences).toEqual(["kids", "junior", "adult", "senior"]);
    expect(guide?.limit).toEqual({ count: 1, period: "week" });
    expect(formatCreditEarnLimit(guide?.limit)).toBe("1 per week");
    expect(guide?.detail).toMatch(/once per week/i);
  });

  it("lets members share a win twice per month on My Dashboard", () => {
    const win = CREDIT_EARN_ACTIONS.find((a) => a.id === "community_win");
    expect(win?.credits).toBe(2);
    expect(win?.limit).toEqual({ count: 2, period: "month" });
    expect(formatCreditEarnLimit(win?.limit)).toBe("2 per month");
    expect(win?.label).toBe("Share a win");
    expect(win?.detail).toMatch(/My Dashboard/i);
    expect(win?.detail).toMatch(/2 per month/i);
  });

  it("pays 10% for $25 and $100 earning milestones", () => {
    const twentyFive = CREDIT_EARN_ACTIONS.find((a) => a.id === "income_25");
    const hundred = CREDIT_EARN_ACTIONS.find((a) => a.id === "income_100");
    expect(twentyFive?.credits).toBe(2.5);
    expect(hundred?.credits).toBe(10);
    expect(formatEarnCreditDelta(2.5)).toBe("+2.5");
    expect(formatEarnCreditDelta(10)).toBe("+10");
    expect(twentyFive?.detail).toMatch(/10%/);
    expect(twentyFive?.detail).toMatch(/\$2\.50/);
    expect(hundred?.detail).toMatch(/10%/);
    expect(hundred?.detail).toMatch(/\$10/);
  });

  it("labels included consulting sessions by tier", () => {
    expect(oneOnOneFeatureLabel("starter")).toBe("1× 60-min or 2× 30-min sessions");
    expect(oneOnOneFeatureLabel("pro")).toBe("2× 60-minute sessions");
    expect(oneOnOneFeatureLabel("elite")).toBe("3× 60-minute sessions");
    expect(oneOnOneSessionCount("starter")).toBe(1);
    expect(oneOnOneSessionCount("pro")).toBe(2);
    expect(oneOnOneSessionCount("elite")).toBe(3);
    expect(MEMBERSHIP_COMPARE_ROWS.find((row) => row.id === "consulting")?.cells).toEqual({
      free: "—",
      starter: "1 × 60 min or 2 × 30 min",
      pro: "2 × 60 min",
      elite: "3 × 60 min",
    });
    expect(MEMBERSHIP_COMPARE_ROWS.find((row) => row.id === "workshop_priority")?.cells).toEqual({
      free: "—",
      starter: "Yes",
      pro: "Yes",
      elite: "Yes",
    });
    expect(tierHasFeature("starter", "workshop_priority")).toBe(true);
    expect(tierHasFeature("pro", "workshop_priority")).toBe(true);
    expect(tierHasFeature("elite", "workshop_priority")).toBe(true);
    expect(tierHasFeature("pro", "training")).toBe(false);
    expect(tierHasFeature("elite", "training")).toBe(false);
  });

  it("surfaces military and veteran messaging for Adults and Seniors only", () => {
    expect(SHOW_MILITARY_VETERAN_CALLOUT).toBe(false);
    expect(MILITARY_VETERAN_CALLOUT.audiences).toEqual(["adult", "senior"]);
    expect(MILITARY_VETERAN_CALLOUT.badge).toMatch(/Military/i);
    expect(MILITARY_VETERAN_CALLOUT.body).toMatch(/Veterans save even more/i);
    // No invented Stripe amounts — senior USD tiers remain the only numeric discounts.
    expect(MILITARY_VETERAN_CALLOUT.body).not.toMatch(/\$\d+/);
  });

  it("gives Free a richer all-levels perk list without paid-feature claims", () => {
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      const perks = MEMBER_PERKS_BY_TIER.free[audience];
      expect(perks.length).toBeGreaterThanOrEqual(5);
      const titles = perks.map((p) => p.title.toLowerCase());
      expect(titles.some((t) => t.includes("guide") || t.includes("ideas"))).toBe(true);
      expect(titles.some((t) => t.includes("wizard") || t.includes("match"))).toBe(true);
      expect(titles.some((t) => t.includes("every age"))).toBe(true);
      // No duplicate “browse free guides” + “free guides library” pair.
      const browseAndLibrary =
        titles.filter((t) => t.includes("browse free guides") || t.includes("free guides library")).length;
      expect(browseAndLibrary).toBeLessThanOrEqual(1);
      const blob = perks.map((p) => `${p.title} ${p.detail}`).join(" ").toLowerCase();
      expect(blob).toMatch(/kids/);
      expect(blob).toMatch(/teen/);
      expect(blob).toMatch(/adult/);
      expect(blob).toMatch(/senior/);
      expect(blob).not.toMatch(/schedule suite|1-on-1 consulting|zip scout/);
    }
    expect(MEMBERSHIP_TIERS.find((t) => t.id === "free")?.tagline).toMatch(/kids.*teens.*adults.*seniors/i);
    expect(MEMBERSHIP_TIERS.find((t) => t.id === "free")?.featureIds).toEqual([]);
  });

  it("uses additive Everything-in perk ladders for every audience", () => {
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      expect(MEMBER_PERKS_BY_TIER.free[audience][0]?.title).not.toMatch(/everything in/i);
      expect(MEMBER_PERKS_BY_TIER.starter[audience][0]?.title).toMatch(/everything in free/i);
      expect(MEMBER_PERKS_BY_TIER.pro[audience][0]?.title).toMatch(/everything in starter/i);
      expect(MEMBER_PERKS_BY_TIER.elite[audience][0]?.title).toMatch(/everything in pro/i);

      const starterBlob = MEMBER_PERKS_BY_TIER.starter[audience]
        .slice(1)
        .map((p) => `${p.title} ${p.detail}`)
        .join(" ")
        .toLowerCase();
      expect(starterBlob).toMatch(/kids, teens, adults & seniors guides, ideas/);
      expect(starterBlob).toMatch(/kids, teens, adults & seniors side hustle match wizards/);
      expect(starterBlob).not.toMatch(/bookmarks/);
      expect(starterBlob).not.toMatch(/free for every age/);

      const numbered = numberedTierPerks("starter", audience);
      expect(numbered[0]?.numberedTitle).toMatch(/^1\)\s+Everything in Free/i);
      expect(numbered[1]?.numberedTitle).toBe(
        "2) Kids, Teens, Adults & Seniors Guides, ideas, etc.",
      );
      expect(numbered[2]?.numberedTitle).toBe(
        "3) Kids, Teens, Adults & Seniors Side Hustle Match Wizards",
      );
    }
  });

  it("numbers Adult Free→Elite perk titles for Membership display", () => {
    const free = numberedTierPerks("free", "adult");
    const elite = numberedTierPerks("elite", "adult");
    expect(free.map((p) => p.numberedTitle)).toEqual([
      "1) Free for every age group",
      "2) Free comes with Side Hustle Guides to choose from",
      "3) Kids, Teens, Adults & Seniors Side Hustle Match Wizards",
      "4) Browse Adults Corner (and every Corner)",
      "5) Free account + Member Dashboard",
    ]);
    expect(elite[0]?.numberedTitle).toBe("1) Everything in Pro, plus:");
    expect(elite[2]?.numberedTitle).toMatch(/^3\)\s+Entry to all workshop sessions — 2 seats/);
    expect(elite.some((p) => /zip.?code.?scout|zip scout/i.test(p.title))).toBe(false);
    expect(elite.some((p) => /group training/i.test(p.title))).toBe(false);
  });

  it("discounts yearly billing (pay for 10 months, get 12)", () => {
    expect(YEARLY_MONTHS_CHARGED).toBe(10);
    for (const tier of MEMBERSHIP_TIERS.filter((t) => t.id !== "free")) {
      for (const audience of ["adult", "senior"] as const) {
        const monthly = tierPriceMonthlyUsd(tier, audience);
        const yearly = tierPriceYearlyUsd(tier, audience);
        expect(yearly).toBe(monthly * YEARLY_MONTHS_CHARGED);
        expect(yearlySavingsUsd(monthly, yearly!)).toBe(monthly * 2);
        expect(yearlySavingsPercent(monthly, yearly!)).toBe(17);
        expect(equivalentMonthlyUsd(yearly!)).toBeCloseTo(yearly! / 12, 2);
      }
    }
  });

  it("uses age-appropriate (not age-right) in Free perk copy", () => {
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      const blob = MEMBER_PERKS_BY_TIER.free[audience]
        .map((p) => `${p.title} ${p.detail}`)
        .join(" ")
        .toLowerCase();
      expect(blob).toMatch(/age-appropriate/);
      expect(blob).not.toMatch(/age-right/);
    }
  });

  it("names Tina & Evelyn in consulting/training copy (not T / E, T & E, or T + E)", () => {
    const blob = [
      ...Object.values(MEMBER_PERKS_BY_TIER).flatMap((byAudience) =>
        Object.values(byAudience).flatMap((perks) =>
          perks.map((p) => `${p.title} ${p.detail}`),
        ),
      ),
      ...MEMBERSHIP_FEATURES.map((f) => `${f.label} ${f.detail}`),
    ].join("\n");
    expect(blob).toMatch(/Tina & Evelyn/);
    expect(blob).toMatch(
      /One 60-minute session or two 30-minute sessions with Tina and\/or Evelyn — 3-month commitment on all paid plans\./,
    );
    expect(blob).not.toMatch(/\bT & E\b/);
    expect(blob).not.toMatch(/\bT \/ E\b/);
    expect(blob).not.toMatch(/\bT \+ E\b/);
  });

  it("includes GYSH merch on Starter and above with hat or T-shirt choice", () => {
    expect(merchItemCount("free")).toBe(0);
    expect(merchItemCount("starter")).toBe(1);
    expect(merchItemCount("pro")).toBe(2);
    expect(merchItemCount("elite")).toBe(2);
    expect(tierHasFeature("free", "merch")).toBe(false);
    expect(tierHasFeature("starter", "merch")).toBe(true);
    expect(parseMerchChoices(["hat"], 1)).toEqual(["hat"]);
    expect(parseMerchChoices(["tshirt", "hat"], 2)).toEqual(["tshirt", "hat"]);
    expect(parseMerchChoices(["hat"], 2)).toBeNull();
    expect(merchChoicesError("starter", [])).toMatch(/T-shirt or hat/);
    expect(merchChoicesError("free", [])).toBeNull();
    expect(merchChoicesError("starter", ["tshirt"])).toBeNull();
    expect(merchChoicesError("starter", ["tshirt"], [""])).toMatch(/size/i);
    expect(merchChoicesError("starter", ["tshirt"], ["M"])).toBeNull();
    expect(formatMerchChoiceNote(["tshirt", "hat"])).toBe("Merch: 1× T-shirt + 1× hat");
    expect(formatMerchChoiceNote(["tshirt"], ["M"])).toBe("Merch: 1× T-shirt (M)");
    expect(mergeMerchNote("Free GYSH member", ["hat"])).toMatch(/Merch: 1× hat/);
    expect(notesHaveMerchChoice("FOUNDING-STARTER 2/5")).toBe(false);
    expect(notesHaveMerchChoice("FOUNDING-STARTER 2/5 · Merch: 1× T-shirt (L)")).toBe(true);
    expect(memberNeedsMerchChoice("starter", "FOUNDING-STARTER 2/5")).toBe(true);
    expect(memberNeedsMerchChoice("starter", "Merch: 1× hat")).toBe(false);
    expect(memberNeedsMerchChoice("free", "")).toBe(false);
    expect(merchChoiceSummaryFromNotes("Adult · Merch: 1× T-shirt (M) · other")).toBe(
      "Merch: 1× T-shirt (M)",
    );
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      expect(MEMBER_PERKS_BY_TIER.starter[audience].some((p) => /t-shirt or hat/i.test(p.title))).toBe(
        true,
      );
      expect(MEMBER_PERKS_BY_TIER.starter[audience].some((p) => /priority workshop access/i.test(p.title))).toBe(
        true,
      );
      expect(MEMBER_PERKS_BY_TIER.pro[audience].some((p) => /2 GYSH T-shirts or hats/i.test(p.title))).toBe(
        true,
      );
      expect(MEMBER_PERKS_BY_TIER.pro[audience].some((p) => /two 60-minute/i.test(p.title))).toBe(true);
      expect(MEMBER_PERKS_BY_TIER.pro[audience].some((p) => /group training/i.test(p.title))).toBe(false);
      expect(MEMBER_PERKS_BY_TIER.elite[audience].some((p) => /group training/i.test(p.title))).toBe(
        false,
      );
      expect(
        MEMBER_PERKS_BY_TIER.elite[audience].some((p) =>
          /entry to all workshop sessions — 2 seats/i.test(p.title),
        ),
      ).toBe(true);
    }
  });
});
