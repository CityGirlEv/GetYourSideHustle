import { describe, expect, it } from "vitest";
import {
  DEFAULT_WORKSHOPS,
  DEFAULT_SPEAKERS,
  WORKSHOPS,
  GUEST_SPEAKERS,
  countWorkshopsByStatus,
  getSpeakerById,
  filterWorkshops,
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
});
