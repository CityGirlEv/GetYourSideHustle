import { describe, expect, it } from "vitest";
import { mustPickAgendaTimes } from "../gysh-partner-agenda";

describe("mustPickAgendaTimes", () => {
  it("applies to Tina / Lyriq Admin Studio accounts", () => {
    expect(
      mustPickAgendaTimes({
        name: "Tina Marie Barham",
        email: "tinamariebarham@gmail.com",
        role: "admin",
        roles: ["admin", "qa"],
      }),
    ).toBe(true);
    expect(
      mustPickAgendaTimes({
        name: "Lyriq",
        email: "leegaulden1222@icloud.com",
        role: "admin",
        roles: ["admin", "qa"],
      }),
    ).toBe(true);
  });

  it("does not lock parent/member logins that merely look like Tina (FAMILY-007)", () => {
    expect(
      mustPickAgendaTimes({
        name: "Tina Barham",
        email: "tinamariebarham@verizon.net",
        role: "adult",
        roles: ["adult"],
      }),
    ).toBe(false);
  });

  it("does not apply to Evelyn admin (no meeting-date gate)", () => {
    expect(
      mustPickAgendaTimes({
        name: "Evelyn Irving",
        email: "evelyn3@cox.net",
        role: "admin",
        roles: ["admin", "qa", "dev"],
      }),
    ).toBe(false);
  });
});
