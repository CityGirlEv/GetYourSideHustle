export const ARE_YOU_SURE_LABEL = 'Are you sure?';

/** Browser popup before any delete. Returns true only if the user confirms. */
export function confirmDelete(): boolean {
  if (typeof window === 'undefined' || typeof window.confirm !== 'function') return false;
  return window.confirm(ARE_YOU_SURE_LABEL);
}
