/** Word/PDF Implementation Plan docs include pricing for Admin and Super Admin. */
export function allowDocumentPricing(canViewBudget: boolean, requestedWithPricing: boolean): boolean {
  return Boolean(canViewBudget && requestedWithPricing);
}
