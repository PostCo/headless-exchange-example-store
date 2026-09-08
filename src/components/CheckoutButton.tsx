"use client";

import { useSyncExternalStore } from "react";
import { cartStore } from "@/cart/cartStore";

/**
 * Stub for the future SDK checkout intercept.
 * Real storefront checkout uses Shopify's `cart.checkoutUrl`.
 * `id` must stay the full GID including `?key=`.
 */
export function proceedToExchange(): string | null {
  const snapshot = cartStore.getSnapshot();
  if (!snapshot?.id) {
    console.warn("[dummy-store] proceedToExchange: no cart snapshot");
    return null;
  }

  console.log("[dummy-store] proceedToExchange cart GID:", snapshot.id);
  console.log("[dummy-store] proceedToExchange checkoutUrl:", snapshot.checkoutUrl);
  return snapshot.checkoutUrl;
}

export function CheckoutButton() {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);
  const checkoutUrl = cart?.checkoutUrl;

  if (!checkoutUrl) {
    return (
      <button type="button" className="checkout__button" disabled>
        Check out
      </button>
    );
  }

  return (
    <a className="checkout__button" href={checkoutUrl} onClick={() => proceedToExchange()}>
      Check out
    </a>
  );
}
