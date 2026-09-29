/** Toggle a payment-plan dropdown key in the Pre-Payment accordion. */
export function toggleExpandedPlan(current: string[], key: string): string[] {
  return current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
}
