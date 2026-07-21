/** Assigned By / Assigned Date merge for test_case_status (mirrors src/lib/gysh-assignment). */

export const SYSTEM_ASSIGNED_BY = "System";

export function todayMMDDYY(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export type ResolveTestAssignedMetaInput = {
  prevAssignee: string;
  nextAssignee: string;
  isNewRow: boolean;
  prevAssignedBy: string;
  prevDateAssigned: string;
  actorLabel: string;
  today: string;
  explicitAssignedBy?: string;
  explicitDateAssigned?: string;
};

export function resolveTestAssignedMeta(
  input: ResolveTestAssignedMetaInput,
): { assignedBy: string; dateAssigned: string } {
  if (input.explicitAssignedBy !== undefined || input.explicitDateAssigned !== undefined) {
    const assignedBy =
      input.explicitAssignedBy !== undefined
        ? String(input.explicitAssignedBy || "").trim() || SYSTEM_ASSIGNED_BY
        : String(input.prevAssignedBy || "").trim() || SYSTEM_ASSIGNED_BY;
    const dateAssigned =
      input.explicitDateAssigned !== undefined
        ? String(input.explicitDateAssigned || "").trim()
        : String(input.prevDateAssigned || "").trim() ||
          (input.isNewRow ? input.today : "");
    return { assignedBy, dateAssigned };
  }

  const prevAssignee = String(input.prevAssignee || "").trim();
  const nextAssignee = String(input.nextAssignee || "").trim();
  const assigneeChanged = nextAssignee !== prevAssignee;

  if (assigneeChanged && !input.isNewRow) {
    return {
      assignedBy: String(input.actorLabel || "").trim() || SYSTEM_ASSIGNED_BY,
      dateAssigned: input.today,
    };
  }

  if (input.isNewRow) {
    return {
      assignedBy: SYSTEM_ASSIGNED_BY,
      dateAssigned: input.today,
    };
  }

  return {
    assignedBy: String(input.prevAssignedBy || "").trim() || SYSTEM_ASSIGNED_BY,
    dateAssigned: String(input.prevDateAssigned || "").trim(),
  };
}
