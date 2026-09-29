/** Optional promo / prize callouts shown under specific guide cards in the library. */

/** Canonical Leaf Blowing Service drawing eligibility copy. */
export const LEAF_BLOWING_BLOWER_DRAWING_COPY =
  "The Side-Hustler that picks this Side-Hustle is eligible for entry in a drawing to win a Free Mini Hand-Held Blower. Conditions apply. Inquire about details via the Contact Form.";

export function guideLibraryPromoCallout(guideId: string): string | null {
  if (guideId === "leaf-raking") {
    return LEAF_BLOWING_BLOWER_DRAWING_COPY;
  }
  return null;
}
