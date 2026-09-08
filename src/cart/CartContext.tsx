"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { addCartLines, createCart } from "@/lib/shopify/api";
import type { CartSnapshot } from "@/lib/shopify/types";
import { cartStore } from "./cartStore";

type CartContextValue = {
  cart: CartSnapshot | null;
  addVariant: (variantId: string, quantity?: number) => Promise<void>;
  pending: boolean;
  error: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.__moxieCartStore = cartStore;
  }, []);

  const addVariant = useCallback(async (variantId: string, quantity = 1) => {
    setPending(true);
    setError(null);
    try {
      const current = cartStore.getSnapshot();
      const next = current
        ? await addCartLines(current.id, variantId, quantity)
        : await createCart(variantId, quantity);
      cartStore.setSnapshot(next);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Add to cart failed.";
      setError(message);
      throw caught;
    } finally {
      setPending(false);
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ cart, addVariant, pending, error }),
    [addVariant, cart, error, pending],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return value;
}

declare global {
  interface Window {
    __moxieCartStore?: typeof cartStore;
  }
}
