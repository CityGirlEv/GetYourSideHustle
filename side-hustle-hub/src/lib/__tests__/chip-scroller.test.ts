import { describe, expect, it } from "vitest";
import { chipScrollerOverflow, chipScrollerStep } from "../chip-scroller";

describe("chip scroller", () => {
  it("detects overflow and which way you can slide", () => {
    expect(
      chipScrollerOverflow({ scrollLeft: 0, scrollWidth: 400, clientWidth: 400 }),
    ).toEqual({ overflow: false, canLeft: false, canRight: false });
    expect(
      chipScrollerOverflow({ scrollLeft: 0, scrollWidth: 720, clientWidth: 320 }),
    ).toEqual({ overflow: true, canLeft: false, canRight: true });
    expect(
      chipScrollerOverflow({ scrollLeft: 200, scrollWidth: 720, clientWidth: 320 }),
    ).toEqual({ overflow: true, canLeft: true, canRight: true });
    expect(
      chipScrollerOverflow({ scrollLeft: 400, scrollWidth: 720, clientWidth: 320 }),
    ).toEqual({ overflow: true, canLeft: true, canRight: false });
  });

  it("steps by most of the visible row", () => {
    expect(chipScrollerStep(200)).toBe(130);
    expect(chipScrollerStep(80)).toBe(120);
  });
});
