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
import { addCartLines, createCart, removeCartLines } from "@/lib/shopify/api";
import type { CartSnapshot } from "@/lib/shopify/types";
import { cartStore } from "./cartStore";

type CartContextValue = {
  cart: CartSnapshot | null;
  addVariant: (variantId: string, quantity?: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  pending: boolean;
  error: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sync the persisted cart with Shopify on load: the return center empties
    // the cart after an exchange, so a fresh visit must reflect that.
    void cartStore.hydrate();
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

  const removeLine = useCallback(async (lineId: string) => {
    const current = cartStore.getSnapshot();
    if (!current) return;
    setPending(true);
    setError(null);
    try {
      cartStore.setSnapshot(await removeCartLines(current.id, [lineId]));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Remove from cart failed.";
      setError(message);
      throw caught;
    } finally {
      setPending(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    const current = cartStore.getSnapshot();
    if (!current || current.lines.length === 0) return;
    setPending(true);
    setError(null);
    try {
      const lineIds = current.lines.map((line) => line.id);
      cartStore.setSnapshot(await removeCartLines(current.id, lineIds));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Clear cart failed.";
      setError(message);
      throw caught;
    } finally {
      setPending(false);
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ cart, addVariant, removeLine, clearCart, pending, error }),
    [addVariant, removeLine, clearCart, cart, error, pending],
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
