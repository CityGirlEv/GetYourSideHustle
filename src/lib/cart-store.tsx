import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildCartItem,
  cartItemKey,
  type CartItem,
  type CartItemPayload,
} from "@/lib/cart-products";
import { toast } from "sonner";

const CART_STORAGE_KEY = "eager-hypatia-purchase-cart";

type StoredCartEntry = {
  payload: CartItemPayload;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (payload: CartItemPayload, quantity?: number) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
  isInCart: (payload: CartItemPayload) => boolean;
};

const CartCtx = createContext<CartContextValue | null>(null);

function loadStoredCart(): StoredCartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCartEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCart(entries: StoredCartEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota / private mode errors
  }
}

function entriesToItems(entries: StoredCartEntry[]): CartItem[] {
  const items: CartItem[] = [];
  for (const entry of entries) {
    try {
      items.push(buildCartItem(entry.payload, entry.quantity));
    } catch {
      // drop invalid legacy entries
    }
  }
  return items;
}

function itemsToEntries(items: CartItem[]): StoredCartEntry[] {
  return items.map((item) => ({
    payload: item.payload,
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => entriesToItems(loadStoredCart()));

  useEffect(() => {
    persistCart(itemsToEntries(items));
  }, [items]);

  const addItem = useCallback((payload: CartItemPayload, quantity = 1) => {
    const nextItem = buildCartItem(payload, quantity);
    setItems((prev) => {
      const existing = prev.find((item) => item.cartKey === nextItem.cartKey);
      if (existing) {
        toast.info(`${existing.label} is already in your cart`);
        return prev;
      }
      toast.success(`Added ${nextItem.label} to cart`);
      return [...prev, nextItem];
    });
  }, []);

  const removeItem = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (payload: CartItemPayload) => items.some((item) => item.cartKey === cartItemKey(payload)),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount: items.length,
      addItem,
      removeItem,
      clearCart,
      isInCart,
    }),
    [items, addItem, removeItem, clearCart, isInCart],
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
