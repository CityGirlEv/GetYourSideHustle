/** Assigned By / Assigned Date merge for test_case_status (mirrors src/lib/gysh-assignment). */

export const SYSTEM_ASSIGNED_BY = "System";

/**
 * Collapse full login names / aliases to short partner labels.
 * "Tina Marie Barham" and "Tina" are the same person → "Tina".
 */
export function canonicalizePartnerLabel(raw: string | null | undefined): string {
  const v = String(raw || "").trim();
  if (!v) return "";
  const lower = v.toLowerCase();
  if (lower === "system") return SYSTEM_ASSIGNED_BY;
  if (lower.includes("@")) {
    if (lower.includes("tina")) return "Tina";
    if (lower.includes("evelyn") || lower.includes("evvelyn")) return "Evelyn";
    if (lower.includes("lyriq") || lower.includes("leegaulden")) return "Lyriq";
    return v;
  }
  if (lower === "tina" || lower.startsWith("tina ")) return "Tina";
  if (lower === "evelyn" || lower.startsWith("evelyn ")) return "Evelyn";
  if (lower === "lyriq" || lower.startsWith("lyriq ")) return "Lyriq";
  return v;
}

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
  const canonBy = (raw: string) =>
    canonicalizePartnerLabel(raw) || String(raw || "").trim() || SYSTEM_ASSIGNED_BY;

  if (input.explicitAssignedBy !== undefined || input.explicitDateAssigned !== undefined) {
    const assignedBy =
      input.explicitAssignedBy !== undefined
        ? canonBy(String(input.explicitAssignedBy || ""))
        : canonBy(String(input.prevAssignedBy || ""));
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
      assignedBy: canonBy(String(input.actorLabel || "")),
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
    assignedBy: canonBy(String(input.prevAssignedBy || "")),
    dateAssigned: String(input.prevDateAssigned || "").trim(),
  };
}
