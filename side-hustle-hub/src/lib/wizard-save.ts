import { BLUEPRINT_DASHBOARD_HREF } from "./member-dashboard";

/** Copy + labels for saving Match Wizard results to My Dashboard. */

export type WizardSaveStatus = "idle" | "saving" | "saved" | "error";

export function wizardSaveButtonLabel(opts: {
  isLoggedIn: boolean;
  status?: WizardSaveStatus;
}): string {
  const status = opts.status ?? "idle";
  if (status === "saving") return "Saving…";
  if (status === "saved") return "Saved to My Dashboard";
  if (status === "error") return "Retry save";
  return opts.isLoggedIn ? "Save to My Dashboard" : "Save my results";
}

export function wizardSaveHint(opts: { isLoggedIn: boolean; status?: WizardSaveStatus }): string {
  const status = opts.status ?? "idle";
  if (status === "saved") {
    return "Your matches are saved. Open My Dashboard anytime to come back to them.";
  }
  if (status === "error") {
    return "Could not save just now. Try again — your matches are still on this page.";
  }
  if (opts.isLoggedIn) {
    return "Save these matches to My Dashboard so you can come back anytime.";
  }
  return "Create a free account to save these matches to My Dashboard.";
}

export function wizardSaveDashboardLabel(): string {
  return "Open My Dashboard";
}

export function wizardResultGuideButtonLabel(): string {
  return "Take me to this guide";
}

export type WizardResultGuideDest = "guide" | "blueprint";

/**
 * Locked paid matches go to My Dashboard Blueprint so a Free member can use
 * their 1 complimentary unlock. Unique Unique Free and already-open guides stay on /guides.
 */
export function wizardResultGuideDestination(input: {
  guideUnlocked: boolean;
  minTier?: string | null;
  offerComplimentaryPick?: boolean;
  needsJoin?: boolean;
}): WizardResultGuideDest {
  if (input.guideUnlocked) return "guide";
  const minTier = String(input.minTier || "free").toLowerCase().trim();
  if (minTier === "free") return "guide";
  if (input.offerComplimentaryPick || input.needsJoin) return "blueprint";
  return "guide";
}

export function wizardResultGuideHref(
  hustleId: string,
  dest: WizardResultGuideDest = "guide",
): string {
  if (dest === "blueprint") return BLUEPRINT_DASHBOARD_HREF;
  return `/guides?hustle=${encodeURIComponent(hustleId)}`;
}
