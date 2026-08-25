import { describe, expect, it, beforeEach } from "vitest";
import {
  addAlaCarteToCart,
  alacarteCartItemCount,
  alacarteCartTotalUsd,
  clearAlaCarteCart,
  readAlaCarteCart,
  removeAlaCarteFromCart,
  setAlaCarteCartQuantity,
  subscribeAlaCarteCart,
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
    expect(alacarteCartTotalUsd(cart)).toBe(75 * 3 + 35);
  });

  it("updates and removes lines", () => {
    addAlaCarteToCart("progress-pdf", 2);
    setAlaCarteCartQuantity("progress-pdf", 1);
    expect(readAlaCarteCart().lines[0]?.quantity).toBe(1);
    removeAlaCarteFromCart("progress-pdf");
    expect(readAlaCarteCart().lines).toEqual([]);
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
