import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const TAB_MARKERS = ["Suggested Pricing", "Supply List", 'label: "Tools"'];

/**
 * Block a production upload when this checkout does not contain the per-guide tabs
 * or the Stripe active-price lookup. Cloudflare `--branch=main` is only a label;
 * it does not mean git `main`.
 * @returns {string | null} error message, or null when the checkout is safe to upload
 */
export function gyshGuideTabsDeployBlocker({ prepSource, guidesSource, stripeSource, checkoutSource }) {
  if (!prepSource) {
    return "Refusing to deploy: src/components/GuidePrepSections.tsx is missing. This checkout does not have the per-guide tabs (About, Suggested Pricing, Supply List, Tools, Steps). Do not upload it. Cloudflare --branch=main is a label, not git main.";
  }
  if (!guidesSource || !guidesSource.includes("GuidePrepSections")) {
    return "Refusing to deploy: StepByStepGuides.tsx does not render GuidePrepSections. The per-guide tabs would be absent on the live site.";
  }
  const missing = TAB_MARKERS.filter((marker) => !prepSource.includes(marker));
  if (missing.length) {
    return `Refusing to deploy: GuidePrepSections.tsx is missing tab markers: ${missing.join(", ")}.`;
  }
  if (stripeSource != null || checkoutSource != null) {
    if (!stripeSource || !stripeSource.includes("function resolveChargeablePriceId")) {
      return "Refusing to deploy: functions/_lib/stripe.ts is missing resolveChargeablePriceId. Checkout would charge a retired Stripe price and the inactive-price error would come back.";
    }
    if (!checkoutSource || !checkoutSource.includes("resolveChargeablePriceId")) {
      return "Refusing to deploy: functions/_lib/stripe-checkout.ts does not call resolveChargeablePriceId. Checkout would keep using a stale catalog price id.";
    }
  }
  return null;
}

export function readGyshGuideTabsDeployBlocker(root) {
  const prepPath = path.join(root, "src", "components", "GuidePrepSections.tsx");
  const guidesPath = path.join(root, "src", "components", "StepByStepGuides.tsx");
  const stripePath = path.join(root, "functions", "_lib", "stripe.ts");
  const checkoutPath = path.join(root, "functions", "_lib", "stripe-checkout.ts");
  return gyshGuideTabsDeployBlocker({
    prepSource: existsSync(prepPath) ? readFileSync(prepPath, "utf8") : null,
    guidesSource: existsSync(guidesPath) ? readFileSync(guidesPath, "utf8") : null,
    stripeSource: existsSync(stripePath) ? readFileSync(stripePath, "utf8") : "",
    checkoutSource: existsSync(checkoutPath) ? readFileSync(checkoutPath, "utf8") : "",
  });
}
