import { describe, expect, it, beforeEach } from "vitest";
import {
  addAlaCarteToCart,
  alacarteCartItemCount,
  alacarteCartTotalUsd,
  clearAlaCarteCart,
  isJoinCartItemId,
  memberVisibleCart,
  memberVisibleCartCount,
  joinCartCatalogItem,
  readAlaCarteCart,
  removeAlaCarteFromCart,
  setAlaCarteCartQuantity,
  subscribeAlaCarteCart,
  supportsAlaCarteStripeCheckout,
} from "../alacarte-cart";
import { clearMemoryStore } from "../browser-storage";

describe("alacarte-cart", () => {
  beforeEach(() => {
    clearMemoryStore();
    clearAlaCarteCart();
  });

  it("adds items and increments quantity", () => {
    addAlaCarteToCart("consult-30");
    addAlaCarteToCart("consult-30", 2);
    addAlaCarteToCart("workshop-general");
    const cart = readAlaCarteCart();
    expect(cart.lines).toEqual([
      { itemId: "consult-30", quantity: 3 },
      { itemId: "workshop-general", quantity: 1 },
    ]);
    expect(alacarteCartItemCount(cart)).toBe(4);
    expect(alacarteCartTotalUsd(cart)).toBe(75 * 3 + 40);
  });

  it("adds parent-funded credit packs at Join pack prices", () => {
    addAlaCarteToCart("boost");
    addAlaCarteToCart("family");
    addAlaCarteToCart("consult-30");
    const cart = readAlaCarteCart();
    expect(cart.lines.map((l) => l.itemId)).toEqual(["boost", "family", "consult-30"]);
    expect(alacarteCartTotalUsd(cart)).toBe(5 + 40 + 75);
    expect(joinCartCatalogItem("launcher")?.kind).toBe("credit_pack");
    expect(joinCartCatalogItem("launcher")?.priceUsd).toBe(20);
    expect(supportsAlaCarteStripeCheckout("boost")).toBe(true);
    expect(isJoinCartItemId("not-a-sku")).toBe(false);
    addAlaCarteToCart("not-a-sku");
    expect(readAlaCarteCart().lines.some((l) => l.itemId === "not-a-sku")).toBe(false);
  });

  it("updates and removes lines", () => {
    addAlaCarteToCart("progress-pdf", 2);
    setAlaCarteCartQuantity("progress-pdf", 1);
    expect(readAlaCarteCart().lines[0]?.quantity).toBe(1);
    removeAlaCarteFromCart("progress-pdf");
    expect(readAlaCarteCart().lines).toEqual([]);
  });

  it("hides persisted cart lines when the visitor is logged out", () => {
    addAlaCarteToCart("consult-30", 2);
    addAlaCarteToCart("boost");
    const stored = readAlaCarteCart();
    expect(alacarteCartItemCount(stored)).toBe(3);
    expect(memberVisibleCartCount(false, stored)).toBe(0);
    expect(memberVisibleCart(false, stored).lines).toEqual([]);
    expect(memberVisibleCartCount(true, stored)).toBe(3);
    expect(memberVisibleCart(true, stored).lines).toEqual(stored.lines);
  });

  it("notifies subscribers when the cart changes", () => {
    const seen: number[] = [];
    const unsub = subscribeAlaCarteCart((cart) => {
      seen.push(alacarteCartItemCount(cart));
    });
    addAlaCarteToCart("consult-30");
    clearAlaCarteCart();
    unsub();
    expect(seen).toEqual([1, 0]);
  });
});
