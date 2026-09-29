/** Visible rows for inline notes — never a 2–3 line stub. */
export const NOTES_VISIBLE_ROWS = 6;
export const NOTES_PREVIEW_MIN_CLASS = 'min-h-[10rem]';
export const NOTES_POPUP_MIN_CLASS = 'min-h-[22rem]';
const CHARS_PER_VISIBLE_ROW = 70;

export function notesLineCount(text: string): number {
  const value = String(text ?? '');
  if (!value) return 1;
  return value.split('\n').length;
}

/** True when notes will not fit in the inline preview without scrolling. */
export function notesNeedFullPopup(text: string, visibleRows = NOTES_VISIBLE_ROWS): boolean {
  const value = String(text ?? '');
  if (notesLineCount(value) > visibleRows) return true;
  return value.length > visibleRows * CHARS_PER_VISIBLE_ROW;
}

export function notesOverflow(scrollHeight: number, clientHeight: number): boolean {
  return Math.ceil(scrollHeight) > Math.ceil(clientHeight) + 2;
}
