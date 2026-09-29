import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolveLaunchGuideData } from "../resolve-launch-guide-data";
import { formatGuideNumber } from "../guide-numbers";
import { guideKitForId } from "../guide-tools";
import { KIDS_GUIDES } from "../kids-guides";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("resolveLaunchGuideData kids / library alignment", () => {
  it("resolves guide 008 Give Back kids guide without falling back to Airbnb", () => {
    const id = "kids-kindness-share";
    expect(formatGuideNumber(id)).toBe("008");
    const airbnbAuthored = [
      {
        id: "airbnb",
        name: "Airbnb Hosting",
        timeframe: "2 - 4 weeks",
        estEarnings: "$1,500+",
        bestFor: "Hosts",
        steps: [{ title: "List the home", desc: "Create an Airbnb listing." }],
        proTip: "Photos",
        pitfall: "Rules",
      },
    ];
    const data = resolveLaunchGuideData(id, airbnbAuthored);
    expect(data.id).toBe(id);
    expect(data.name).toMatch(/Give Back: Share a Skill for Free/i);
    expect(data.name).not.toMatch(/Airbnb/i);
    expect(data.steps.length).toBeGreaterThan(0);
    expect(data.steps.some((s) => /kindness|parent thumbs up/i.test(s.title))).toBe(true);

    const kit = guideKitForId(id);
    expect(kit.steps?.length).toBeGreaterThan(0);
    expect(kit.steps?.[0]?.title).not.toMatch(/List the home|Airbnb/i);
  });

  it("keeps every kids/teen library guide id and title aligned", () => {
    for (const g of KIDS_GUIDES) {
      const data = resolveLaunchGuideData(g.id, [
        {
          id: "airbnb",
          name: "Airbnb Hosting",
          timeframe: "x",
          estEarnings: "x",
          bestFor: "x",
          steps: [{ title: "Wrong", desc: "Wrong" }],
          proTip: "",
          pitfall: "",
        },
      ]);
      expect(data.id, g.id).toBe(g.id);
      expect(data.name, g.id).toBe(g.title);
      expect(data.steps.length, g.id).toBeGreaterThan(0);
    }
  });

  it("keeps extra helpers out of StepByStepGuides so Fast Refresh can update the lazy library page", () => {
    const src = readFileSync(join(root, "src/components/StepByStepGuides.tsx"), "utf8");
    expect(src).not.toMatch(/export function resolveLaunchGuideData/);
    expect(src).toMatch(/from "\.\.\/lib\/resolve-launch-guide-data"/);
  });
});
