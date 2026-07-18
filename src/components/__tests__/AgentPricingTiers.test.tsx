import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentPricingTiers } from "@/components/AgentPricingTiers";
import { CartProvider } from "@/lib/cart-store";
import { MOBILE_BREAKPOINT } from "@/hooks/use-mobile";
import {
  AGENT_TIER_ORDER,
  AGENT_TIERS,
  formatAgentTierTabMeta,
} from "@/lib/agent-pricing-tiers";

const DEFAULT_VIEWPORT_WIDTH = 1024;

function mockViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

function renderAgentPricingTiers(props: ComponentProps<typeof AgentPricingTiers> = {}) {
  return render(
    <CartProvider>
      <AgentPricingTiers {...props} />
    </CartProvider>,
  );
}

describe("AgentPricingTiers", () => {
  beforeEach(() => {
    mockViewport(DEFAULT_VIEWPORT_WIDTH);
  });

  afterEach(() => {
    mockViewport(DEFAULT_VIEWPORT_WIDTH);
  });
  it("renders tier tabs with monthly price meta and default Silver panel", () => {
    renderAgentPricingTiers();
    expect(screen.getByTestId("agent-pricing-tiers")).toBeInTheDocument();
    for (const tierId of AGENT_TIER_ORDER) {
      const tab = screen.getByRole("tab", { name: new RegExp(AGENT_TIERS[tierId].name) });
      expect(tab).toBeInTheDocument();
      expect(within(tab).getByText(formatAgentTierTabMeta(tierId))).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Silver" })).toBeInTheDocument();
    expect(screen.getByText("4 leads/mo included")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Bronze" })).not.toBeInTheDocument();
  });

  it("switches tier detail panel when a tab is selected", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    await user.click(screen.getByRole("tab", { name: /Gold/i }));
    expect(screen.getByRole("heading", { name: "Gold" })).toBeInTheDocument();
    expect(screen.getByText("6 leads/mo included")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Silver" })).not.toBeInTheDocument();
  });

  it("shows tier-specific à la carte add-ons inside the active tab", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    await user.click(screen.getByRole("tab", { name: /Bronze/i }));
    const aLaCarte = screen.getByTestId("tier-a-la-carte-bronze");
    expect(within(aLaCarte).getByText("À la carte")).toBeInTheDocument();

    expect(screen.getByText("All Plans national catalog")).toBeInTheDocument();
    expect(screen.getByText("County report — ZIP prefix (3 digits)")).toBeInTheDocument();
  });

  it("renders a collapsible à la carte section on every tier tab", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    for (const tierId of AGENT_TIER_ORDER) {
      await user.click(screen.getByRole("tab", { name: new RegExp(AGENT_TIERS[tierId].name) }));
      const aLaCarte = screen.getByTestId(`tier-a-la-carte-${tierId}`);
      expect(within(aLaCarte).getByText("À la carte")).toBeInTheDocument();
      expect(within(aLaCarte).getByRole("button", { name: /à la carte/i })).toBeInTheDocument();
    }
  });

  it("does not show a package summary card on any tier tab", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    for (const tierId of AGENT_TIER_ORDER) {
      await user.click(screen.getByRole("tab", { name: new RegExp(AGENT_TIERS[tierId].name) }));
      expect(screen.queryByText(/your package/i)).not.toBeInTheDocument();
    }
  });

  it("reflects add-on checkbox selection in the à la carte section", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    await user.click(screen.getByRole("tab", { name: /Bronze/i }));
    const aLaCarte = screen.getByTestId("tier-a-la-carte-bronze");

    const allPlansLabel = screen.getByText("All Plans national catalog").closest("label");
    expect(allPlansLabel).not.toBeNull();
    await user.click(within(allPlansLabel!).getByRole("checkbox"));

    expect(within(allPlansLabel!).getByRole("checkbox")).toBeChecked();
    expect(within(aLaCarte).getByText(/1 selected/)).toBeInTheDocument();
    expect(screen.queryByText("Your package")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /add to cart/i }).length).toBeGreaterThan(1);
  });

  it("expands à la carte by default on desktop viewports", async () => {
    mockViewport(MOBILE_BREAKPOINT);
    const user = userEvent.setup();
    renderAgentPricingTiers();

    await user.click(screen.getByRole("tab", { name: /Bronze/i }));
    expect(screen.getByText("All Plans national catalog")).toBeInTheDocument();
  });

  it("collapses à la carte by default on mobile viewports", async () => {
    mockViewport(MOBILE_BREAKPOINT - 1);
    const user = userEvent.setup();
    renderAgentPricingTiers();

    await user.click(screen.getByRole("tab", { name: /Bronze/i }));
    expect(screen.queryByText("All Plans national catalog")).not.toBeInTheDocument();
  });

  it("hides à la carte when comparison view is open", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    await user.click(screen.getByRole("button", { name: "Compare all plans" }));
    expect(screen.queryByTestId("tier-a-la-carte-silver")).not.toBeInTheDocument();
    expect(screen.queryByText("À la carte")).not.toBeInTheDocument();
  });

  it("calls onTierChange when controlled", async () => {
    const user = userEvent.setup();
    const onTierChange = vi.fn();
    renderAgentPricingTiers({ activeTier: "silver", onTierChange });

    await user.click(screen.getByRole("tab", { name: /Platinum/i }));
    expect(onTierChange).toHaveBeenCalledWith("platinum");
  });

  it("keeps per-lead add-on below the tier tabs section", () => {
    renderAgentPricingTiers();
    expect(screen.getByRole("heading", { name: "Per-lead add-on" })).toBeInTheDocument();
  });

  it("toggles side-by-side comparison table with Compare all plans", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    expect(screen.queryByTestId("agent-tier-comparison")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Compare all plans" }));
    const comparison = screen.getByTestId("agent-tier-comparison");
    expect(comparison).toBeInTheDocument();
    expect(within(comparison).getByText("Monthly price")).toBeInTheDocument();
    expect(within(comparison).getByText("Included leads")).toBeInTheDocument();
    expect(within(comparison).getByText("Minimum term")).toBeInTheDocument();
    expect(within(comparison).getByText("Overage per lead")).toBeInTheDocument();
    expect(within(comparison).getByText("Lead allocation")).toBeInTheDocument();
    expect(within(comparison).getAllByRole("button", { name: /add to cart/i }).length).toBe(4);
    expect(screen.queryByRole("heading", { name: "Silver" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide comparison" }));
    expect(screen.queryByTestId("agent-tier-comparison")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Silver" })).toBeInTheDocument();
  });

  it("closes comparison when a tier tab is selected", async () => {
    const user = userEvent.setup();
    renderAgentPricingTiers();

    await user.click(screen.getByRole("button", { name: "Compare all plans" }));
    expect(screen.getByTestId("agent-tier-comparison")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Gold/i }));
    expect(screen.queryByTestId("agent-tier-comparison")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gold" })).toBeInTheDocument();
  });
});
