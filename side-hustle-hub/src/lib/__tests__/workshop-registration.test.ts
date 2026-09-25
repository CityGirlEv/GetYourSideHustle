import { describe, expect, it } from "vitest";
import {
  workshopEmailAlreadyOnRoster,
  workshopRegistrationConfirmationLead,
  workshopRegistrationConfirmationSubject,
  workshopRosterSeatsTaken,
} from "../workshop-registration";

describe("workshop roster", () => {
  it("counts registered seats and ignores cancelled rows", () => {
    expect(
      workshopRosterSeatsTaken([
        { attendeeCount: 2, status: "registered" },
        { attendeeCount: 1, status: "cancelled" },
        { attendeeCount: 3, status: "registered" },
      ]),
    ).toBe(5);
  });

  it("detects an email already on the roster", () => {
    const rows = [
      { email: "brenda@example.com", status: "registered" as const },
      { email: "other@example.com", status: "cancelled" as const },
    ];
    expect(workshopEmailAlreadyOnRoster(rows, "  Brenda@Example.com ")).toBe(true);
    expect(workshopEmailAlreadyOnRoster(rows, "other@example.com")).toBe(false);
  });

  it("names the confirmation email after the workshop", () => {
    expect(workshopRegistrationConfirmationSubject("90-Minute AI Marketing Video Workshop")).toBe(
      "You're registered — 90-Minute AI Marketing Video Workshop",
    );
    expect(workshopRegistrationConfirmationLead("90-Minute AI Marketing Video Workshop")).toMatch(
      /You're on the roster/i,
    );
  });
});
