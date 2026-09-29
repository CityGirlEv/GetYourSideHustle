import { describe, expect, it } from "vitest";
import {
  adminLandingTabAfterLogin,
  postLoginStaffDestination,
} from "../admin-login-landing";

describe("adminLandingTabAfterLogin", () => {
  it("sends Evelyn and Candace (admin/QA) to Testing Portal", () => {
    expect(
      adminLandingTabAfterLogin({
        name: "Evelyn Irving",
        email: "evelyn3@cox.net",
        roles: ["admin", "qa", "dev"],
      }),
    ).toBe("testing");
    expect(
      adminLandingTabAfterLogin({
        name: "Candace Jackson",
        email: "candace@example.com",
        roles: ["admin", "qa"],
      }),
    ).toBe("testing");
  });

  it("sends Tina and Lyriq to Agenda when meeting picks are still required", () => {
    expect(
      adminLandingTabAfterLogin({
        name: "Tina Marie Barham",
        email: "tina@example.com",
        roles: ["admin", "qa"],
      }),
    ).toBe("agenda");
    expect(
      adminLandingTabAfterLogin({
        name: "Lyriq Gaulden",
        email: "lyriq@example.com",
        roles: ["admin", "qa"],
      }),
    ).toBe("agenda");
  });

  it("defaults unknown admins to Testing Portal", () => {
    expect(
      adminLandingTabAfterLogin({
        name: "Partner",
        email: "partner@example.com",
        roles: ["admin"],
      }),
    ).toBe("testing");
  });
});

describe("postLoginStaffDestination", () => {
  it("sends QA-only testers straight to Testing Portal", () => {
    expect(
      postLoginStaffDestination({
        name: "Milford Hutsell",
        email: "milford@example.com",
        roles: ["qa"],
      }),
    ).toEqual({ view: "admin", tab: "testing" });
  });

  it("keeps full admins on Admin Studio landing (testing or agenda)", () => {
    expect(
      postLoginStaffDestination({
        name: "Evelyn Irving",
        email: "evelyn3@cox.net",
        roles: ["admin", "qa"],
      }),
    ).toEqual({ view: "admin", tab: "testing" });
  });

  it("returns null for members", () => {
    expect(
      postLoginStaffDestination({
        name: "Member",
        email: "member@example.com",
        roles: ["adult"],
      }),
    ).toBeNull();
  });
});
