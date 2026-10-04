import { describe, expect, it } from "vitest";
import {
  AI_SCENE_PACKS_WORKSHOP_ID,
  DEFAULT_WORKSHOPS,
  DEFAULT_SPEAKERS,
  WORKSHOPS,
  GUEST_SPEAKERS,
  countWorkshopsByStatus,
  findWorkshopById,
  getSpeakerById,
  filterWorkshops,
  mergeWorkshops,
  mergeGuestSpeakers,
  parseWorkshopRegisterParam,
  parseWorkshopCardParam,
  workshopIsPreRegistration,
  workshopScheduleLabel,
  workshopRegistrationConfirmVars,
  workshopRegistrationEmailTaken,
  WORKSHOP_DUPLICATE_EMAIL_MESSAGE,
  workshopForRegistrationLookup,
  workshopRowIsRegistrationOpen,
  workshopCompleteGuideUnlocked,
  workshopDateJustLocked,
  workshopFieldIsSet,
  workshopRegistrationPath,
  workshopRegistrationUrl,
  workshopCardPath,
  workshopCardUrl,
  workshopCardAnchorId,
  workshopCapacityLabel,
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

  it("opens 90-Minute AI Marketing Video Hands-On Workshop via a registration deep link", () => {
    const w = findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(w?.title).toBe("90-Minute AI Marketing Video Hands-On Workshop");
    expect(w?.tags).toEqual(["AI Video"]);
    expect(w?.tags).not.toContain("Scene Production Packs");
    expect(w?.tags).not.toContain("Content");
    expect(w?.speakerIds).toEqual(["tina", "evelyn"]);
    expect(w?.capacity).toBe(10);
    expect(workshopCapacityLabel(w!)).toBe("10 participants max");
    expect(workshopIsPreRegistration(w!)).toBe(true);
    expect(workshopRegistrationPath(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      "/workshops?register=ai-marketing-video",
    );
    expect(parseWorkshopRegisterParam("?register=ai-marketing-video")).toBe(
      AI_SCENE_PACKS_WORKSHOP_ID,
    );
    expect(parseWorkshopRegisterParam("?register=ai-scene-production-packs")).toBe(
      AI_SCENE_PACKS_WORKSHOP_ID,
    );
    expect(workshopRegistrationUrl(AI_SCENE_PACKS_WORKSHOP_ID, "https://getyoursidehustle.com")).toBe(
      "https://getyoursidehustle.com/workshops?register=ai-marketing-video",
    );
    expect(workshopCardPath(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      "/workshops?workshop=ai-marketing-video",
    );
    expect(parseWorkshopCardParam("?workshop=ai-marketing-video")).toBe(
      AI_SCENE_PACKS_WORKSHOP_ID,
    );
    expect(parseWorkshopCardParam("?workshop=ai-scene-production-packs")).toBe(
      AI_SCENE_PACKS_WORKSHOP_ID,
    );
    expect(workshopCardUrl(AI_SCENE_PACKS_WORKSHOP_ID, "https://getyoursidehustle.com")).toBe(
      "https://getyoursidehustle.com/workshops?workshop=ai-marketing-video",
    );
    expect(workshopCardAnchorId(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(
      "workshop-card-ai-scene-production-packs",
    );
    const keptCap = mergeWorkshops([{ ...w!, capacity: 25 }]);
    expect(findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID, keptCap)?.capacity).toBe(10);
  });

  it("does not list Marcus Hale on workshop cards", () => {
    expect(DEFAULT_SPEAKERS.some((s) => /marcus hale/i.test(s.name))).toBe(false);
    expect(DEFAULT_WORKSHOPS.some((w) => w.speakerIds.includes("guest-str"))).toBe(false);
    const merged = mergeWorkshops([
      {
        ...findWorkshopById("airbnb-arbitrage-101")!,
        speakerIds: ["evelyn", "guest-str"],
      },
    ]);
    expect(findWorkshopById("airbnb-arbitrage-101", merged)?.speakerIds).toEqual(["evelyn"]);
    const withOldTag = mergeWorkshops([
      {
        ...findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID)!,
        tags: ["AI Video", "Scene Production Packs", "Content"],
      },
    ]);
    expect(findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID, withOldTag)?.tags).toEqual(["AI Video"]);
    expect(mergeGuestSpeakers([{ id: "guest-str", name: "Marcus Hale", title: "", bio: "", topics: [], accent: "", initials: "MH" }]).some((s) => s.id === "guest-str")).toBe(false);
    expect(
      mergeGuestSpeakers([
        { id: "tina", name: "Tina Marie Barham", title: "", bio: "", topics: [], accent: "", initials: "TB" },
        { id: "sp-guest", name: "Ada Guest", title: "Host", bio: "", topics: ["AI"], accent: "#9B2F28", initials: "AG" },
      ]).map((s) => s.id),
    ).toEqual(["tina", "sp-guest"]);
  });

  it("allows only one registration per email for the same workshop", () => {
    expect(workshopRegistrationEmailTaken(["evelyn@cox.net"], "Evelyn@Cox.net")).toBe(true);
    expect(workshopRegistrationEmailTaken(["other@x.com"], "evelyn@cox.net")).toBe(false);
    expect(WORKSHOP_DUPLICATE_EMAIL_MESSAGE).toMatch(/one registration per email/i);
  });

  it("builds workshop confirmation email vars for pre-registration", () => {
    const w = findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID)!;
    const vars = workshopRegistrationConfirmVars({
      name: "Evelyn",
      workshopId: w.id,
      title: w.title,
      date: w.date,
      time: w.time,
      format: w.format,
      registrationNote: w.registrationNote,
      registrationOpen: w.registrationOpen,
    });
    expect(workshopScheduleLabel(w)).toBe("Date & time TBD");
    expect(vars.workshopKind).toBe("pre-registration");
    expect(vars.workshopTitle).toBe("90-Minute AI Marketing Video Hands-On Workshop");
    expect(vars.workshopWhen).toBe("Date & time TBD");
    expect(vars.ctaUrl).toContain("/workshops?workshop=ai-marketing-video");
    expect(vars.workshopNextLine).toMatch(/date and time are locked/i);
  });

  it("resolves the public slug to a catalog workshop for D1 registration writes", () => {
    const bySlug = workshopForRegistrationLookup("ai-marketing-video");
    const byId = workshopForRegistrationLookup(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(bySlug.id).toBe(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(bySlug.seed?.title).toBe("90-Minute AI Marketing Video Hands-On Workshop");
    expect(bySlug.seed?.registrationOpen).toBe(true);
    expect(byId.id).toBe(bySlug.id);
    expect(workshopRowIsRegistrationOpen(bySlug.seed, false)).toBe(true);
    expect(workshopRowIsRegistrationOpen(undefined, false)).toBe(false);
    expect(workshopRowIsRegistrationOpen(undefined, true)).toBe(true);
    expect(workshopForRegistrationLookup("").id).toBe("");
    expect(workshopForRegistrationLookup("unknown-workshop").seed).toBeUndefined();
  });

  it("locks the complete-guide PDF until GYSH admin sets a real date", () => {
    expect(workshopFieldIsSet("TBD")).toBe(false);
    expect(workshopFieldIsSet("Date TBD")).toBe(false);
    expect(workshopFieldIsSet("Saturday, October 11")).toBe(true);
    expect(workshopCompleteGuideUnlocked({ isAdmin: true, date: "TBD" })).toBe(true);
    expect(workshopCompleteGuideUnlocked({ isAdmin: false, date: "TBD" })).toBe(false);
    expect(
      workshopCompleteGuideUnlocked({ isAdmin: false, date: "Saturday, October 11" }),
    ).toBe(true);
    expect(workshopDateJustLocked("TBD", "Saturday, October 11")).toBe(true);
    expect(workshopDateJustLocked("Saturday, October 11", "Sunday, October 12")).toBe(false);
    expect(workshopDateJustLocked("TBD", "TBD")).toBe(false);
    const dated = mergeWorkshops([
      {
        ...findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID)!,
        date: "Saturday, October 11",
        time: "10:00 AM CT",
      },
    ]);
    expect(findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID, dated)?.date).toBe("Saturday, October 11");
    expect(findWorkshopById(AI_SCENE_PACKS_WORKSHOP_ID, dated)?.time).toBe("10:00 AM CT");
  });
});
