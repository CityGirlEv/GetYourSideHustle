/**
 * Join shopping cart (localStorage) — a-la-carte services + parent-funded credit packs.
 */
import { getLocalStore } from "./browser-storage";
import {
  ALA_CARTE_PRICE_LIST,
  CREDIT_PACKS,
  type AlaCarteItem,
  type CreditPack,
} from "./membership";
import { joinCartStripePrice } from "./stripe-catalog";

const CART_KEY = "gysh_alacarte_cart_v1";
export const ALA_CARTE_CART_EVENT = "gysh:alacarte-cart";

export type AlaCarteCartLine = {
  itemId: string;
  quantity: number;
};

export type AlaCarteCart = {
  lines: AlaCarteCartLine[];
  updatedAt: string;
};

export type JoinCartLineItem = {
  id: string;
  name: string;
  priceUsd: number;
  kind: "alacarte" | "credit_pack";
  credits?: number;
  detail?: string;
  includedIn?: AlaCarteItem["includedIn"];
};

const cartListeners = new Set<(cart: AlaCarteCart) => void>();

export function emptyAlaCarteCart(): AlaCarteCart {
  return { lines: [], updatedAt: new Date().toISOString() };
}

function notifyAlaCarteCartChanged(cart: AlaCarteCart): void {
  for (const listener of [...cartListeners]) {
    try {
      listener(cart);
    } catch {
      /* ignore listener errors */
    }
  }
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(ALA_CARTE_CART_EVENT, { detail: cart }));
  } catch {
    /* ignore */
  }
}

/** Subscribe to cart changes (same tab listeners + other tabs via storage). */
export function subscribeAlaCarteCart(listener: (cart: AlaCarteCart) => void): () => void {
  cartListeners.add(listener);
  if (typeof window === "undefined") {
    return () => {
      cartListeners.delete(listener);
    };
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_KEY || e.key === null) listener(readAlaCarteCart());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    cartListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function joinCartCatalogItem(itemId: string): JoinCartLineItem | null {
  const pack = CREDIT_PACKS.find((p) => p.id === itemId);
  if (pack) return creditPackCartItem(pack);
  const item = ALA_CARTE_PRICE_LIST.find((i) => i.id === itemId);
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    priceUsd: item.priceUsd,
    kind: "alacarte",
    credits: item.credits,
    detail: item.detail,
    includedIn: item.includedIn,
  };
}

function creditPackCartItem(pack: CreditPack): JoinCartLineItem {
  return {
    id: pack.id,
    name: `${pack.name} (${pack.credits} Kid Credits)`,
    priceUsd: pack.priceUsd,
    kind: "credit_pack",
    credits: pack.credits,
    detail: pack.detail,
  };
}

export function isJoinCartItemId(itemId: string): boolean {
  return joinCartCatalogItem(itemId) != null;
}

export function readAlaCarteCart(): AlaCarteCart {
  try {
    const raw = getLocalStore().getItem(CART_KEY);
    if (!raw) return emptyAlaCarteCart();
    const parsed = JSON.parse(raw) as AlaCarteCart;
    if (!parsed || !Array.isArray(parsed.lines)) return emptyAlaCarteCart();
    const lines = parsed.lines
      .map((l) => ({
        itemId: String(l.itemId || "").trim(),
        quantity: Math.max(0, Math.min(99, Math.floor(Number(l.quantity) || 0))),
      }))
      .filter((l) => l.itemId && l.quantity > 0 && isJoinCartItemId(l.itemId));
    return { lines, updatedAt: parsed.updatedAt || new Date().toISOString() };
  } catch {
    return emptyAlaCarteCart();
  }
}

export function writeAlaCarteCart(cart: AlaCarteCart): AlaCarteCart {
  const next: AlaCarteCart = {
    lines: cart.lines
      .map((l) => ({
        itemId: String(l.itemId || "").trim(),
        quantity: Math.max(0, Math.min(99, Math.floor(Number(l.quantity) || 0))),
      }))
      .filter((l) => l.itemId && l.quantity > 0 && isJoinCartItemId(l.itemId)),
    updatedAt: new Date().toISOString(),
  };
  getLocalStore().setItem(CART_KEY, JSON.stringify(next));
  notifyAlaCarteCartChanged(next);
  return next;
}

export function clearAlaCarteCart(): AlaCarteCart {
  const empty = emptyAlaCarteCart();
  getLocalStore().setItem(CART_KEY, JSON.stringify(empty));
  notifyAlaCarteCartChanged(empty);
  return empty;
}

export function addAlaCarteToCart(itemId: string, quantity = 1): AlaCarteCart {
  if (!isJoinCartItemId(itemId)) return readAlaCarteCart();
  const cart = readAlaCarteCart();
  const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
  const existing = cart.lines.find((l) => l.itemId === itemId);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + qty);
  } else {
    cart.lines.push({ itemId, quantity: qty });
  }
  return writeAlaCarteCart(cart);
}

export function setAlaCarteCartQuantity(itemId: string, quantity: number): AlaCarteCart {
  const cart = readAlaCarteCart();
  const qty = Math.floor(quantity);
  if (qty <= 0) {
    return writeAlaCarteCart({
      ...cart,
      lines: cart.lines.filter((l) => l.itemId !== itemId),
    });
  }
  if (!isJoinCartItemId(itemId)) return cart;
  const existing = cart.lines.find((l) => l.itemId === itemId);
  if (existing) existing.quantity = Math.min(99, qty);
  else cart.lines.push({ itemId, quantity: Math.min(99, qty) });
  return writeAlaCarteCart(cart);
}

export function removeAlaCarteFromCart(itemId: string): AlaCarteCart {
  const cart = readAlaCarteCart();
  return writeAlaCarteCart({
    ...cart,
    lines: cart.lines.filter((l) => l.itemId !== itemId),
  });
}

export function alacarteCartItemCount(cart: AlaCarteCart = readAlaCarteCart()): number {
  return cart.lines.reduce((n, l) => n + l.quantity, 0);
}

/** Guests never see leftover localStorage lines as an active cart. */
export function memberVisibleCart(
  isLoggedIn: boolean,
  cart: AlaCarteCart = readAlaCarteCart(),
): AlaCarteCart {
  if (!isLoggedIn) return emptyAlaCarteCart();
  return cart;
}

export function memberVisibleCartCount(
  isLoggedIn: boolean,
  cart: AlaCarteCart = readAlaCarteCart(),
): number {
  return alacarteCartItemCount(memberVisibleCart(isLoggedIn, cart));
}

export function alacarteCartTotalUsd(cart: AlaCarteCart = readAlaCarteCart()): number {
  let total = 0;
  for (const line of cart.lines) {
    const item = joinCartCatalogItem(line.itemId);
    if (item) total += item.priceUsd * line.quantity;
  }
  return Math.round(total * 100) / 100;
}

export function resolveAlaCarteCartLines(
  cart: AlaCarteCart = readAlaCarteCart(),
): Array<{ item: JoinCartLineItem; quantity: number; lineTotalUsd: number; stripeReady: boolean }> {
  return cart.lines
    .map((line) => {
      const item = joinCartCatalogItem(line.itemId);
      if (!item) return null;
      return {
        item,
        quantity: line.quantity,
        lineTotalUsd: Math.round(item.priceUsd * line.quantity * 100) / 100,
        stripeReady: joinCartStripePrice(item.id) != null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
}

export function supportsAlaCarteStripeCheckout(itemId: string): boolean {
  return joinCartStripePrice(itemId) != null;
}
