import { describe, expect, it } from "vitest";
import { COMMUNITY_TEACHING_PRICING } from "../community-teaching-workshops-guide";
import { CLEANING_SERVICE_PRICING } from "../cleaning-service-guide";
import {
  formatPricingLine,
  introLineDuplicatesPricingItem,
  organizeSuggestedPricingCopy,
  type GuidePricingItem,
} from "../guide-suggested-pricing";

describe("formatPricingLine", () => {
  it("uses label + price + notes", () => {
    expect(
      formatPricingLine({
        id: "quick",
        label: "Quick Help",
        price: "$10–$15/job",
        notes: "30–60 minutes of simple parent-present help",
      }),
    ).toBe("Quick Help: $10–$15/job — 30–60 minutes of simple parent-present help");
  });

  it("falls back to name when label is missing", () => {
    const item = {
      id: "quick",
      name: "Quick Help",
      price: "$10–$15/job",
    } as GuidePricingItem;
    expect(formatPricingLine(item)).toBe("Quick Help: $10–$15/job");
  });
});

describe("organizeSuggestedPricingCopy", () => {
  it("turns intro lines into bullets and drops rows that repeat items", () => {
    const items: GuidePricingItem[] = [
      {
        id: "intro",
        label: "45–60 minute introductory session",
        price: "$50–$100",
        notes: "One focused topic",
      },
    ];
    const organized = organizeSuggestedPricingCopy({
      intro: [
        "GUIDE TITLE — REPLACE PRICING",
        "Displayed $50 – $200 / session is examples only, not guarantees.",
        "45–60 minute introductory session: $50 – $100 — one focused topic, simple handout.",
        "Formula: Prep + Teaching Time = Quote.",
      ].join("\n"),
      items,
    });

    const introText = organized.introBlocks.flatMap((block) =>
      block.kind === "bullets" ? block.lines : [block.text],
    );
    expect(introText.some((line) => /replace pricing/i.test(line))).toBe(false);
    expect(introText.some((line) => /45–60 minute introductory session/i.test(line))).toBe(
      false,
    );
    expect(introText).toContain(
      "Displayed $50 – $200 / session is examples only, not guarantees.",
    );
    expect(introText).toContain("Formula: Prep + Teaching Time = Quote.");
    expect(organized.items).toEqual(items);
  });

  it("does not repeat Community Teaching session prices in the intro", () => {
    const organized = organizeSuggestedPricingCopy(COMMUNITY_TEACHING_PRICING);
    const introText = organized.introBlocks
      .flatMap((block) => (block.kind === "bullets" ? block.lines : [block.text]))
      .join("\n");

    expect(introText).not.toMatch(/REPLACE PRICING/i);
    expect(introText).not.toMatch(/45–60 minute introductory session:/i);
    expect(introText).not.toMatch(/75–90 minute hands-on workshop:/i);
    expect(introText).not.toMatch(/Two-part series:/i);
    expect(introText).not.toMatch(/Private group or staff workshop:/i);
    expect(introText).not.toMatch(/Per-participant model:/i);
    expect(introText).not.toMatch(/Online workshop:/i);
    expect(introText).toMatch(/Displayed \$50 – \$200/i);
    expect(introText).toMatch(/Formula:/i);
    expect(introText).toMatch(/Monthly examples/i);
    expect(organized.items).toHaveLength(6);
  });

  it("keeps unique cleaning-service context and skips duplicated offer rows", () => {
    const organized = organizeSuggestedPricingCopy(CLEANING_SERVICE_PRICING);
    const introText = organized.introBlocks
      .flatMap((block) => (block.kind === "bullets" ? block.lines : [block.text]))
      .join("\n");

    expect(introText).toMatch(/STANDARD CLEAN/i);
    expect(introText).toMatch(/PRICING FORMULA/i);
    expect(introText).not.toMatch(/^Small Home\/Apartment:/m);
    expect(introText).not.toMatch(/^Medium Home:/m);
    expect(organized.items.some((item) => /small home/i.test(item.label))).toBe(true);
  });
});

describe("introLineDuplicatesPricingItem", () => {
  const items: GuidePricingItem[] = [
    {
      id: "intro",
      label: "45–60 minute introductory session",
      price: "$50–$100",
      notes: "One focused topic",
    },
  ];

  it("matches an intro offer that restates the item", () => {
    expect(
      introLineDuplicatesPricingItem(
        "45–60 minute introductory session: $50 – $100 — one focused topic, simple handout.",
        items,
      ),
    ).toBe(true);
  });

  it("keeps formula and monthly example lines", () => {
    expect(
      introLineDuplicatesPricingItem(
        "Monthly examples only: 2 sessions × $75 = $150 gross/month.",
        items,
      ),
    ).toBe(false);
  });
});
