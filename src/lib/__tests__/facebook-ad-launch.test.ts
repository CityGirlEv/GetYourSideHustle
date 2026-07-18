import { describe, expect, it } from "vitest";
import {
  FACEBOOK_AD_COPY,
  FACEBOOK_AD_HEDRA_CHARACTER_IMAGE_PROMPT,
  FACEBOOK_AD_HEDRA_SCENES,
  FACEBOOK_AD_LAUNCH_EVENT_ID,
  FACEBOOK_AD_LAUNCH_TIME,
  buildFacebookAdLaunchEvents,
  buildFacebookAdLaunchSteps,
  buildFacebookAdProduceSteps,
  facebookAdAdminHref,
  facebookAdStepCopyContent,
  getFacebookAdScheduleDates,
  withStandaloneEditorialEvents,
} from "@/lib/content-factory/facebook-ad-launch";
import { MPD_DISCLAIMER } from "@/lib/medicare-disclaimers";
import { buildEditorialCalendar } from "@/lib/content-factory/weekly-editorial-schedule";
import { checklistItemsForDate } from "@/lib/content-factory/editorial-daily-checklist";

const anchor = new Date(2026, 5, 26);
const dates = getFacebookAdScheduleDates(anchor);

describe("facebook-ad-launch", () => {
  it("includes TPMO-safe disclaimer and MPD in ad copy", () => {
    expect(FACEBOOK_AD_COPY.primaryText).toMatch(/Educational only/i);
    expect(FACEBOOK_AD_COPY.primaryText).toContain(MPD_DISCLAIMER);
    expect(FACEBOOK_AD_COPY.destinationUrl).toMatch(/scenario\/new/);
  });

  it("avoids non-compliant Meta/CMS marketing phrases in ad fields", () => {
    const fields = [
      FACEBOOK_AD_COPY.primaryText,
      FACEBOOK_AD_COPY.headline,
      FACEBOOK_AD_COPY.description,
    ].join("\n");
    expect(fields).not.toMatch(/\bfree\b/i);
    expect(fields).not.toMatch(/\bbest\b/i);
    expect(fields).not.toMatch(/\bguaranteed\b/i);
    expect(fields).not.toMatch(/\ball plans\b/i);
  });

  it("uses CMS-safe Hedra prompts without government materials or readable UI", () => {
    const prompts = FACEBOOK_AD_HEDRA_SCENES.map((s) => s.prompt).join("\n");
    expect(prompts).toMatch(/no readable/i);
    expect(prompts).toMatch(/no Medicare card/i);
    expect(FACEBOOK_AD_HEDRA_SCENES).toHaveLength(5);
    expect(FACEBOOK_AD_HEDRA_CHARACTER_IMAGE_PROMPT).toMatch(/Photorealistic portrait/i);
    expect(FACEBOOK_AD_HEDRA_SCENES.every((s) => /this character/i.test(s.prompt))).toBe(true);
  });

  it("produce checklist leads with character image then per-scene Hedra steps", () => {
    const dates = getFacebookAdScheduleDates(anchor);
    const steps = buildFacebookAdProduceSteps(dates);
    expect(steps[0]?.id).toBe("hedra-character");
    expect(steps[0]?.copyField).toBe("hedraCharacterImage");
    expect(steps.filter((s) => s.hedraSceneId)).toHaveLength(5);
    expect(steps.some((s) => s.id === "hedra-stitch")).toBe(true);
    expect(steps.some((s) => s.id === "meta-login")).toBe(true);
    expect(steps[5]?.id).toBe("hedra-stitch");
    expect(steps[6]?.hedraSceneId).toBe("cta-close");
    expect(steps).toHaveLength(14);
    const ctaStep = steps.find((s) => s.hedraSceneId === "cta-close");
    expect(ctaStep && facebookAdStepCopyContent(ctaStep)).toMatch(/You oughta give it a whirl\./i);
  });

  it("launch checklist includes mobile disclaimer and video preview steps", () => {
    const dates = getFacebookAdScheduleDates(anchor);
    const steps = buildFacebookAdLaunchSteps(dates);
    expect(steps.some((s) => s.id === "disclaimer-visible")).toBe(true);
    expect(steps.some((s) => s.id === "video-preview")).toBe(true);
    expect(steps).toHaveLength(6);
  });

  it("tells a conversational sales-call story in voiceover without superlatives", () => {
    const vo = FACEBOOK_AD_HEDRA_SCENES.map((s) => s.voiceoverLine).join(" ");
    expect(vo).toMatch(/hung up/i);
    expect(vo).toMatch(/overwhelming/i);
    expect(vo).toMatch(/give it a whirl/i);
    expect(vo).not.toMatch(/\btremendous/i);
    expect(vo).not.toMatch(/\bbest\b/i);
    expect(vo).not.toMatch(/\bfree\b/i);
  });

  it("schedules produce tonight and launch tomorrow morning", () => {
    const events = buildFacebookAdLaunchEvents(anchor);
    expect(events).toHaveLength(2);
    expect(events.find((e) => e.id === FACEBOOK_AD_LAUNCH_EVENT_ID)?.date).toBe(
      dates.launchDate,
    );
    expect(events.find((e) => e.id === FACEBOOK_AD_LAUNCH_EVENT_ID)?.actionTime).toBe(
      FACEBOOK_AD_LAUNCH_TIME,
    );
    expect(events.find((e) => e.id === "facebook_ad:produce")?.date).toBe(dates.produceDate);
  });

  it("links Meta admin for calendar deep links", () => {
    expect(facebookAdAdminHref("produce")).toBe(
      "/admin/meta?campaign=plan-comparison-v1&milestone=produce",
    );
    expect(facebookAdAdminHref("launch")).toContain("milestone=launch");
  });

  it("appears on the editorial calendar for produce + launch dates", () => {
    const events = withStandaloneEditorialEvents(
      buildEditorialCalendar({ today: anchor }),
      anchor,
    );
    const produce = checklistItemsForDate(events, dates.produceDate);
    const launch = checklistItemsForDate(events, dates.launchDate);
    expect(produce.some((i) => i.event.id === "facebook_ad:produce")).toBe(true);
    expect(launch.some((i) => i.event.id === FACEBOOK_AD_LAUNCH_EVENT_ID)).toBe(true);
    expect(launch.find((i) => i.event.id === FACEBOOK_AD_LAUNCH_EVENT_ID)?.time).toBe("06:30");
  });
});
