/** Optional promo / prize callouts shown under specific guide cards in the library. */

export function guideLibraryPromoCallout(guideId: string): string | null {
  if (guideId === "leaf-raking") {
    return "Qualifies for entry for a Free Mini Hand Held Blower. Optional: purchase a Mini Hand Held Blower if you want gear before the drawing.";
  }
  return null;
}
