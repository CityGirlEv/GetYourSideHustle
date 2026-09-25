import { describe, expect, it } from "vitest";
import {
  DEFAULT_WORKSHOPS,
  DEFAULT_SPEAKERS,
  WORKSHOPS,
  GUEST_SPEAKERS,
  AI_SCENE_PACKS_WORKSHOP_ID,
  countWorkshopsByStatus,
  findWorkshopById,
  getSpeakerById,
  filterWorkshops,
  parseWorkshopRegisterParam,
  resolveWorkshopId,
  workshopPublicRegisterSlug,
} from "../workshops";

describe("workshops", () => {
  it("has workshops and guest speakers", () => {
    expect(WORKSHOPS.length).toBeGreaterThan(0);
    expect(GUEST_SPEAKERS.length).toBeGreaterThan(0);
    expect(DEFAULT_WORKSHOPS.length).toBe(WORKSHOPS.length);
    expect(DEFAULT_SPEAKERS.length).toBe(GUEST_SPEAKERS.length);
  });

  it("keeps all workshop dates as TBD", () => {
    expect(WORKSHOPS.every((w) => w.date === "TBD")).toBe(true);
  });

  it("keeps every workshop upcoming with TBD times and only the AI video class open for registration", () => {
    expect(DEFAULT_WORKSHOPS.every((w) => w.status === "upcoming")).toBe(true);
    expect(DEFAULT_WORKSHOPS.every((w) => w.time === "TBD")).toBe(true);
    expect(DEFAULT_WORKSHOPS.filter((w) => w.registrationOpen).map((w) => w.id)).toEqual([
      AI_SCENE_PACKS_WORKSHOP_ID,
    ]);
    expect(DEFAULT_WORKSHOPS.find((w) => w.id === AI_SCENE_PACKS_WORKSHOP_ID)?.title).toBe(
      "90-Minute AI Marketing Video Workshop",
    );
  });

  it("counts workshops by status", () => {
    const upcoming = countWorkshopsByStatus("upcoming");
    expect(upcoming).toBeGreaterThan(0);
    expect(upcoming).toBeLessThanOrEqual(WORKSHOPS.length);
  });

  it("looks up speakers by id", () => {
    expect(getSpeakerById("tina")?.name).toBe("Tina Marie Barham");
    expect(getSpeakerById("lyriq")?.name).toBe("Lyriq Gaulden");
    expect(getSpeakerById("lyriq")?.title).toMatch(/Kids & Youth/i);
    expect(getSpeakerById("missing")).toBeUndefined();
  });

  it("filters by status and audience", () => {
    const kids = filterWorkshops("all", "kids");
    expect(kids.every((w) => w.audience === "kids" || w.audience === "all")).toBe(true);
  });

  it("maps the public AI marketing video register slug onto the catalog workshop", () => {
    expect(resolveWorkshopId("ai-marketing-video")).toBe(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(resolveWorkshopId("90-minute-ai-marketing-video-workshop")).toBe(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(parseWorkshopRegisterParam("?register=ai-marketing-video")).toBe(
      AI_SCENE_PACKS_WORKSHOP_ID,
    );
    expect(parseWorkshopRegisterParam("?register=90-minute-ai-marketing-video-workshop")).toBe(
      AI_SCENE_PACKS_WORKSHOP_ID,
    );
    expect(workshopPublicRegisterSlug(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      "90-minute-ai-marketing-video-workshop",
    );
    expect(workshopPublicRegisterSlug("ai-marketing-video")).toBe(
      "90-minute-ai-marketing-video-workshop",
    );
    expect(findWorkshopById("90-minute-ai-marketing-video-workshop", [
      { id: AI_SCENE_PACKS_WORKSHOP_ID } as (typeof DEFAULT_WORKSHOPS)[number],
    ])?.id).toBe(AI_SCENE_PACKS_WORKSHOP_ID);
  });
});
