import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { CartProvider, useCart } from "@/lib/cart-store";
import { toast } from "sonner";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("cart-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(toast.success).mockClear();
  });

  it("adds items and prevents duplicates", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ kind: "agent-tier", tierId: "bronze" });
    });
    expect(result.current.itemCount).toBe(1);
    expect(result.current.isInCart({ kind: "agent-tier", tierId: "bronze" })).toBe(true);
    expect(toast.success).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.addItem({ kind: "agent-tier", tierId: "bronze" });
    });
    expect(result.current.itemCount).toBe(1);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it("removes items and clears the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ kind: "agent-addon", addOnId: "lead-tools" });
      result.current.addItem({ kind: "stripe-plan", planKey: "payg_1" });
    });
    expect(result.current.itemCount).toBe(2);

    const firstKey = result.current.items[0]?.cartKey;
    act(() => {
      if (firstKey) result.current.removeItem(firstKey);
    });
    expect(result.current.itemCount).toBe(1);

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.itemCount).toBe(0);
  });

  it("persists cart entries to localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ kind: "lead-generation-per-lead", quantity: 1 });
    });

    const stored = window.localStorage.getItem("eager-hypatia-purchase-cart");
    expect(stored).toContain("lead-generation-per-lead");
    expect(stored).toContain("per-lead");
  });
});
