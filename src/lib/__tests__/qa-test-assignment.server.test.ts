import { describe, it, expect } from "vitest";
import {
  isEnabledQaAccount,
  isUnassignNotificationCandidate,
  NON_QA_ASSIGNEE_LABELS,
} from "@/lib/qa-test-assignment.server";

describe("isUnassignNotificationCandidate", () => {
  it("fires when a named QA owner moves to Unassigned", () => {
    expect(isUnassignNotificationCandidate("Jane", "Unassigned")).toBe(true);
    expect(isUnassignNotificationCandidate(" Catria ", "Unassigned")).toBe(true);
  });

  it("skips when already unassigned or non-QA owners", () => {
    expect(isUnassignNotificationCandidate("Unassigned", "Unassigned")).toBe(false);
    expect(isUnassignNotificationCandidate("Eng", "Unassigned")).toBe(false);
    expect(isUnassignNotificationCandidate("", "Unassigned")).toBe(false);
  });

  it("fires when assignee changes to another QA user", () => {
    expect(isUnassignNotificationCandidate("Jane", "Alex")).toBe(true);
  });
});

describe("isEnabledQaAccount", () => {
  it("requires qa role and active account, email confirmation optional", () => {
    expect(isEnabledQaAccount({ hasQaRole: true, emailConfirmed: true, banned: false })).toBe(true);
    expect(isEnabledQaAccount({ hasQaRole: true, emailConfirmed: false, banned: false })).toBe(true);
    expect(isEnabledQaAccount({ hasQaRole: false, emailConfirmed: true, banned: false })).toBe(
      false,
    );
    expect(isEnabledQaAccount({ hasQaRole: true, emailConfirmed: true, banned: true })).toBe(false);
  });
});

describe("NON_QA_ASSIGNEE_LABELS", () => {
  it("includes system owners that should not receive QA emails", () => {
    expect(NON_QA_ASSIGNEE_LABELS.has("Unassigned")).toBe(true);
    expect(NON_QA_ASSIGNEE_LABELS.has("Eng")).toBe(true);
  });
});
