import { describe, expect, it } from "vitest";
import { adminLandingTabAfterLogin } from "../admin-login-landing";

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
        email: "candacejackson1@icloud.com",
        roles: ["admin", "qa"],
      }),
    ).toBe("testing");
  });

  it("keeps Tina and Lyriq on Agenda for the meeting-date gate", () => {
    expect(
      adminLandingTabAfterLogin({
        name: "Tina Marie Barham",
        email: "tinamariebarham@gmail.com",
        roles: ["admin", "qa"],
      }),
    ).toBe("agenda");
    expect(
      adminLandingTabAfterLogin({
        name: "Lyriq",
        email: "leegaulden1222@icloud.com",
        roles: ["admin", "qa"],
      }),
    ).toBe("agenda");
  });

  it("does not force Agenda for member accounts that only resemble Tina", () => {
    expect(
      adminLandingTabAfterLogin({
        name: "Tina Member",
        email: "tinamember@example.com",
        roles: ["adult"],
      }),
    ).toBe("testing");
  });
});
