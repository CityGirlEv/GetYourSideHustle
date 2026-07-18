import { describe, expect, it } from "vitest";
import {
  BACKLOG_SPRINT,
  SPRINT_THEMES,
  buildDefaultPlanItems,
  buildRolloutCalendar,
  ceremoniesForSprint,
  getSprintWindow,
  sprintStartTuesday,
  themeForSprint,
  weeklySyncForSprint,
} from "../gysh-sprints";

describe("gysh-sprints", () => {
  const ref = new Date(2026, 6, 16);

  it("computes Sprint 0 as Tue Jul 14 – Mon Jul 20, 2026", () => {
    const s0 = getSprintWindow(0, ref);
    expect(s0.label).toBe("Sprint 0");
    expect(s0.startLabel).toBe("Jul 14, 2026");
    expect(s0.endLabel).toBe("Jul 20, 2026");
    expect(sprintStartTuesday(ref).getDay()).toBe(2);
  });

  it("includes weekly T + E sync on sprint Tuesday", () => {
    const s0 = getSprintWindow(0, ref);
    const meet = weeklySyncForSprint(s0);
    expect(meet.title).toMatch(/T \+ E/);
    expect(meet.owner).toBe("Both");
    expect(meet.kind).toBe("meeting");
    expect(meet.date).toBe("2026-07-14");
  });

  it("builds rollout calendar with FB, brand, Kevina, workshops", () => {
    const items = buildRolloutCalendar(ref);
    const titles = items.map((i) => i.title).join(" | ");
    expect(titles).toMatch(/Facebook/i);
    expect(titles).toMatch(/Brand/i);
    expect(titles).toMatch(/Kevina/i);
    expect(titles).toMatch(/workshops/i);
    expect(titles).toMatch(/weekly sync/i);
    expect(items.some((i) => i.sprint === 0)).toBe(true);
  });

  it("commits former backlog items into themed sprints", () => {
    const items = buildDefaultPlanItems(ref);
    expect(items.every((i) => i.sprint !== BACKLOG_SPRINT)).toBe(true);
    expect(items.some((i) => i.id === "bl-newsletter" && i.sprint === 1)).toBe(true);
    expect(items.some((i) => i.id === "bl-ai-brainstorm" && i.sprint === 4)).toBe(true);
    expect(items.some((i) => i.sprint === 0)).toBe(true);
  });

  it("exposes sprint themes for the schedule UI", () => {
    expect(SPRINT_THEMES.length).toBeGreaterThanOrEqual(8);
    expect(themeForSprint(0)?.theme).toMatch(/Brand|public/i);
    expect(themeForSprint(2)?.theme).toMatch(/Go public|Introduce|world/i);
    expect(themeForSprint(5)?.theme).toMatch(/Junior|Adult|FMSH/i);
  });

  it("schedules standup 3x, planning day-before-end, and retrospective", () => {
    const s0 = getSprintWindow(0, ref);
    const ceremonies = ceremoniesForSprint(s0);
    const standups = ceremonies.filter((c) => c.type === "standup");
    expect(standups).toHaveLength(3);
    expect(standups.map((c) => c.date)).toEqual(["2026-07-14", "2026-07-16", "2026-07-18"]);
    const planning = ceremonies.find((c) => c.type === "planning");
    expect(planning?.date).toBe("2026-07-19"); // Sunday — day before Mon end
    const retro = ceremonies.find((c) => c.type === "retrospective");
    expect(retro?.date).toBe("2026-07-20");
  });
});
