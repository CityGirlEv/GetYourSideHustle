import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  gyshGuideTabsDeployBlocker,
  readGyshGuideTabsDeployBlocker,
} from "../../../scripts/gysh-deploy-guard.mjs";

const hubRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const prepWithTabs = `
  label: "Suggested Pricing"
  label: "Supply List"
  label: "Tools"
`;

describe("GYSH deploy guard", () => {
  it("allows the current checkout because the guide tabs are present", () => {
    expect(readGyshGuideTabsDeployBlocker(hubRoot)).toBeNull();
  });

  it("rejects a checkout that has no GuidePrepSections file", () => {
    expect(
      gyshGuideTabsDeployBlocker({
        prepSource: null,
        guidesSource: 'import { GuidePrepSections } from "./GuidePrepSections"',
      }),
    ).toMatch(/GuidePrepSections.tsx is missing/);
  });

  it("rejects a guides page that does not render the tab component", () => {
    expect(
      gyshGuideTabsDeployBlocker({
        prepSource: prepWithTabs,
        guidesSource: "export function StepByStepGuides() { return null }",
      }),
    ).toMatch(/does not render GuidePrepSections/);
  });

  it("rejects a prep file that dropped the tab labels", () => {
    expect(
      gyshGuideTabsDeployBlocker({
        prepSource: "export function GuidePrepSections() { return null }",
        guidesSource: "<GuidePrepSections />",
      }),
    ).toMatch(/Suggested Pricing/);
  });

  it("rejects a checkout that would charge a retired Stripe price", () => {
    expect(
      gyshGuideTabsDeployBlocker({
        prepSource: prepWithTabs,
        guidesSource: "<GuidePrepSections />",
        stripeSource: "export async function createStripeCheckoutSession() { return null }",
        checkoutSource: "writeStripeLineItems(form, catalogLineItems)",
      }),
    ).toMatch(/resolveChargeablePriceId/);
  });
});
