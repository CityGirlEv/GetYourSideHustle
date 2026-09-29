/**
 * Parse guide step descriptions that embed ☐ / ☑ checklist lines
 * (marketing plan steps, etc.) into interactive segments.
 * Authored DETAILED_STEPS must use ☐ only — ✓ / ☑ / ✔ render pre-checked.
 */

export type GuideStepDescSegment =
  | { kind: "text"; text: string }
  | { kind: "check"; index: number; label: string; checkedMarker: boolean };

const CHECK_LINE_RE = /^\s*[☐☑✓✔]\s*(.*)$/u;

/** True when a description contains at least one checkbox line. */
export function stepDescHasChecklist(desc: string): boolean {
  return String(desc || "")
    .split(/\r?\n/)
    .some((line) => CHECK_LINE_RE.test(line));
}

/**
 * Split a step description into plain text blocks and checklist items.
 * Checklist item `index` is 0-based among check lines only (stable for persistence).
 */
export function parseGuideStepDesc(desc: string): GuideStepDescSegment[] {
  const lines = String(desc || "").split(/\r?\n/);
  const segments: GuideStepDescSegment[] = [];
  let textBuf: string[] = [];
  let checkIndex = 0;

  const flushText = () => {
    if (textBuf.length === 0) return;
    const text = textBuf.join("\n");
    textBuf = [];
    if (text.length > 0) segments.push({ kind: "text", text });
  };

  for (const line of lines) {
    const m = line.match(CHECK_LINE_RE);
    if (m) {
      flushText();
      const marker = line.trimStart()[0] ?? "☐";
      segments.push({
        kind: "check",
        index: checkIndex++,
        label: (m[1] ?? "").trimEnd(),
        checkedMarker: marker !== "☐",
      });
    } else {
      textBuf.push(line);
    }
  }
  flushText();
  return segments;
}

/** Persist key for one checklist item inside a launch-guide step. */
export function guideStepChecklistItemKey(
  guideId: string,
  stepIdx: number,
  itemIdx: number,
): string {
  return `${guideId}-${stepIdx}-i${itemIdx}`;
}
