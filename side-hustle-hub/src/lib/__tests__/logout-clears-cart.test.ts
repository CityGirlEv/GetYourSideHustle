import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearMemoryStore } from "../browser-storage";

const api = vi.fn();
const setSessionToken = vi.fn();

vi.mock("../api", () => ({
  api: (...args: unknown[]) => api(...args),
  setSessionToken: (...args: unknown[]) => setSessionToken(...args),
}));

import { logout } from "../auth";
import { addAlaCarteToCart, alacarteCartItemCount, readAlaCarteCart } from "../alacarte-cart";

describe("logout clears cart", () => {
  beforeEach(() => {
    clearMemoryStore();
    api.mockReset();
    setSessionToken.mockReset();
  });

  it("empties the persisted cart before the logout API returns", async () => {
    addAlaCarteToCart("consult-30", 2);
    expect(alacarteCartItemCount()).toBe(2);

    let release: (value: { ok: true }) => void = () => {};
    api.mockImplementation(
      () =>
        new Promise<{ ok: true }>((resolve) => {
          release = resolve;
        }),
    );

    const pending = logout();
    expect(setSessionToken).toHaveBeenCalledWith(null);
    expect(readAlaCarteCart().lines).toEqual([]);
    expect(alacarteCartItemCount()).toBe(0);

    release({ ok: true });
    await pending;
  });
});
