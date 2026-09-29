/** Advance a zero-based carousel index, wrapping at the end. */
export function nextGearGalleryIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  const cur = Number.isFinite(current) ? Math.trunc(current) : 0;
  return ((cur % length) + length + 1) % length;
}
