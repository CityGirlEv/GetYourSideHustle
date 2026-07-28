import { describe, expect, it } from "vitest";
import {
  SYSTEM_ASSIGNED_BY,
  assignedBySelectOptions,
  auditActorLabel,
  canSetTestBlocked,
  canonicalizePartnerLabel,
  resolveTestAssignedMeta,
  taskAssignByForActor,
  todayMMDDYY,
  userCanChangeTestStatus,
  userHasAdminRole,
} from "../gysh-assignment";

describe("gysh-assignment", () => {
  it("defaults new status rows to System even when catalog assignee is persisted", () => {
    const meta = resolveTestAssignedMeta({
      prevAssignee: "",
      nextAssignee: "evelyn",
      isNewRow: true,
      prevAssignedBy: "",
      prevDateAssigned: "",
      actorLabel: "Evelyn",
      today: "07/19/26",
    });
    expect(meta).toEqual({
      assignedBy: SYSTEM_ASSIGNED_BY,
      dateAssigned: "07/19/26",
    });
  });

  it("updates Assigned By to actor when assignee changes on an existing row", () => {
    const meta = resolveTestAssignedMeta({
      prevAssignee: "tina",
      nextAssignee: "lyriq",
      isNewRow: false,
      prevAssignedBy: SYSTEM_ASSIGNED_BY,
      prevDateAssigned: "07/01/26",
      actorLabel: "Evelyn Irving",
      today: "07/19/26",
    });
    expect(meta).toEqual({
      assignedBy: "Evelyn",
      dateAssigned: "07/19/26",
    });
  });

  it("preserves Assigned By on unrelated status/sprint updates", () => {
    const meta = resolveTestAssignedMeta({
      prevAssignee: "evelyn",
      nextAssignee: "evelyn",
      isNewRow: false,
      prevAssignedBy: "Tina Marie Barham",
      prevDateAssigned: "07/10/26",
      actorLabel: "Evelyn Irving",
      today: "07/19/26",
    });
    expect(meta).toEqual({
      assignedBy: "Tina",
      dateAssigned: "07/10/26",
    });
  });

  it("honors explicit API overrides for bulk/reassign including new rows", () => {
    const meta = resolveTestAssignedMeta({
      prevAssignee: "",
      nextAssignee: "lyriq",
      isNewRow: true,
      prevAssignedBy: "",
      prevDateAssigned: "",
      actorLabel: "Evelyn",
      today: "07/19/26",
      explicitAssignedBy: "Evelyn",
      explicitDateAssigned: "07/19/26",
    });
    expect(meta).toEqual({
      assignedBy: "Evelyn",
      dateAssigned: "07/19/26",
    });
  });

  it("uses name then email for audit actor labels", () => {
    expect(auditActorLabel({ name: "Tina", email: "tina@example.com" })).toBe("Tina");
    expect(auditActorLabel({ name: "Tina Marie Barham", email: "tina@example.com" })).toBe("Tina");
    expect(auditActorLabel({ name: "Evelyn Irving", email: "evelyn@example.com" })).toBe("Evelyn");
    expect(auditActorLabel({ name: "", email: "evelyn@example.com" })).toBe("Evelyn");
    expect(auditActorLabel(null)).toBe(SYSTEM_ASSIGNED_BY);
    expect(taskAssignByForActor({ name: "Lyriq" })).toBe("Lyriq");
    expect(canonicalizePartnerLabel("Tina Marie Barham")).toBe("Tina");
  });

  it("formats today as MM/DD/YY", () => {
    expect(todayMMDDYY(new Date(2026, 6, 19))).toBe("07/19/26");
  });

  it("builds Assigned By select options with presets plus custom current values", () => {
    expect(assignedBySelectOptions("Tina Marie Barham", "Evelyn Irving", "System")).toEqual([
      SYSTEM_ASSIGNED_BY,
      "Tina",
      "Evelyn",
      "Lyriq",
    ]);
  });

  it("detects admin role vs QA-only portal access", () => {
    expect(userHasAdminRole({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userHasAdminRole({ role: "qa", roles: ["qa"] })).toBe(false);
    expect(userHasAdminRole({ role: "qa", roles: ["qa", "admin"] })).toBe(true);
    expect(userHasAdminRole(null)).toBe(false);
  });

  it("allows QA and Dev (not only admin) to change test status", () => {
    expect(userCanChangeTestStatus({ role: "qa", roles: ["qa"] })).toBe(true);
    expect(userCanChangeTestStatus({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanChangeTestStatus({ role: "dev", roles: ["dev"] })).toBe(true);
    expect(userCanChangeTestStatus({ role: "adult", roles: ["adult"] })).toBe(false);
    expect(userCanChangeTestStatus(null)).toBe(false);
  });

  it("allows only Evelyn to set test Blocked", () => {
    expect(canSetTestBlocked({ email: "evelyn3@cox.net", name: "Evelyn Irving" })).toBe(true);
    expect(canSetTestBlocked({ email: "evvelyn3@cox.net", name: "Evelyn" })).toBe(true);
    expect(canSetTestBlocked({ email: "other@example.com", name: "Evelyn" })).toBe(true);
    expect(canSetTestBlocked({ email: "tinamariebarham@gmail.com", name: "Tina Marie Barham" })).toBe(
      false,
    );
    expect(canSetTestBlocked({ email: "leegaulden1222@icloud.com", name: "Lyriq Gaulden" })).toBe(
      false,
    );
    expect(canSetTestBlocked({ email: "admin@example.com", name: "Admin" })).toBe(false);
    expect(canSetTestBlocked(null)).toBe(false);
  });

  it("preserves Assigned Date when only Assigned By is overridden", () => {
    const meta = resolveTestAssignedMeta({
      prevAssignee: "evelyn",
      nextAssignee: "evelyn",
      isNewRow: false,
      prevAssignedBy: "System",
      prevDateAssigned: "07/01/26",
      actorLabel: "Evelyn Partner",
      today: "07/19/26",
      explicitAssignedBy: "Tina",
    });
    expect(meta).toEqual({
      assignedBy: "Tina",
      dateAssigned: "07/01/26",
    });
  });
});
