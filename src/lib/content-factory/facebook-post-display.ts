import {
  WORKBOOK_PAGE_FB_SLOT,
  WORKBOOK_PERSONAL_FB_SLOT,
  isWorkbookPromoFacebookPost,
} from "@/lib/content-factory/workbook-facebook-posts";

export {
  isWorkbookPromoFacebookPost,
  WORKBOOK_PAGE_FB_SLOT,
  WORKBOOK_PERSONAL_FB_SLOT,
};

/** Short role label — matches batch seed order (slot 0 = Facebook Post 1). */
export const FACEBOOK_POST_ROLE_LABELS: string[] = [
  "Article 1 promo (Prior Authorization — launch day)",
  "Article 2 promo (Medigap open enrollment window)",
  "Article 3 promo ($0 premium vs total cost)",
  "Workbook + Still Working at 65 article — Facebook Page post (10:30 AM)",
  "Standalone tip (read plan documents, not just ads)",
  "Standalone tip (doctor in network article promo)",
  "Standalone tip (Part D formulary changes)",
  "Workbook — personal profile share (your story, tag friends)",
];

export function facebookPostNumber(slotIndex: number): number {
  return slotIndex + 1;
}

export function facebookPostRoleLabel(slotIndex: number): string {
  return FACEBOOK_POST_ROLE_LABELS[slotIndex] ?? `Post ${slotIndex + 1}`;
}

export function facebookPostHeading(slotIndex: number, total: number): string {
  return `Facebook Post ${facebookPostNumber(slotIndex)} of ${total}`;
}

export function isWorkbookLaunchPostGroup(slotIndex: number): boolean {
  return slotIndex === WORKBOOK_PAGE_FB_SLOT;
}
