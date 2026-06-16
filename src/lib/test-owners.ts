// Pure helper for computing the full owner set of a test case.
//
// A test can have multiple owners. When a test fails (or is in
// failed_retest), Eng becomes a co-owner alongside the original QA so the
// test shows up in BOTH owners' bubbles, filters, and scoped views — we
// no longer hand the row off from QA to Eng on fail.

export interface ComputeOwnersInput {
  primary: string; // already-resolved QA owner (no fail reroute)
  status: string | undefined;
  isAutomated?: boolean; // automated tests stay owned by the runner
  devOwner?: string; // resolved dev owner; defaults to Eng on fail
}

export function computeTestOwners({
  primary,
  status,
  isAutomated,
  devOwner,
}: ComputeOwnersInput): string[] {
  const failed = status === "fail" || status === "failed_retest";
  const dev = devOwner || "Eng";
  if (failed && !isAutomated && primary !== "Eng" && primary !== "Unassigned") {
    if (dev === primary) return [primary];
    return [primary, dev];
  }
  return [primary];
}
