"use client";

import { useSyncExternalStore } from "react";
import { cartStore } from "@/cart/cartStore";
import { useExchange } from "@/exchange/ExchangeProvider";

/**
 * Cart checkout button.
 *
 * DEVELOPER'S JOB: during an exchange session the SDK exposes
 * `state.isExchangeSession === true`. When it is, reroute your own checkout to
 * `controller.proceedToExchange()` — which redirects back to the return center
 * (or, in test mode, ends the session and shows the dev modal instead of
 * redirecting). Outside an exchange it's a normal Shopify checkout.
 *
 * The controller comes from the shared `ExchangeProvider`, so this button and
 * the status bar always agree on the current session.
 */
export function CheckoutButton() {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);
  const { controller, state } = useExchange();

  // In an exchange session, override checkout to proceed to the exchange. Real
  // mode redirects to the return center; test mode ends the session and the SDK
  // shows its own dev-only modal.
  if (state?.isExchangeSession && controller) {
    return (
      <button
        type="button"
        className="checkout__button"
        onClick={() => controller.proceedToExchange()}
        disabled={!state.cartId}
      >
        Proceed with exchange
      </button>
    );
  }

  // Normal Shopify checkout.
  if (cart?.checkoutUrl) {
    return (
      <a className="checkout__button" href={cart.checkoutUrl}>
        Check out
      </a>
    );
  }
  return (
    <button type="button" className="checkout__button" disabled>
      Check out
    </button>
  );
}
