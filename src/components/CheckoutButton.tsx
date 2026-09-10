"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  initExchange,
  type CartAdapter,
  type ExchangeController,
  type ExchangeState,
} from "@postco/headless-exchange-sdk";
import { cartStore } from "@/cart/cartStore";
import { TestModeModal } from "./TestModeModal";

// Same CartAdapter shape the status bar builds — the SDK ships no default, so
// each integration point maps its own cart onto it.
const adapter: CartAdapter = {
  getCart: () => cartStore.getSnapshot(),
  subscribe: (cb) => cartStore.subscribe(cb),
  clearCart: () => cartStore.setSnapshot(null),
};

/**
 * Cart checkout button.
 *
 * DEVELOPER'S JOB: during an exchange session the SDK exposes
 * `state.isExchangeSession === true`. When it is, reroute your own checkout to
 * `controller.proceedToExchange()` — which redirects back to the return center
 * (or, in test mode, ends the session and shows the dev modal instead of
 * redirecting). Outside an exchange it's a normal Shopify checkout.
 */
export function CheckoutButton() {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);
  const [controller, setController] = useState<ExchangeController | null>(null);
  const [state, setState] = useState<ExchangeState | null>(null);
  const [testModeOpen, setTestModeOpen] = useState(false);

  useEffect(() => {
    const c = initExchange({ cart: adapter });
    setController(c);
    const unsub = c.subscribe(setState);
    return () => {
      unsub();
      c.destroy();
    };
  }, []);

  const handleProceed = (): void => {
    if (state?.isTestMode) setTestModeOpen(true);
    controller?.proceedToExchange();
  };

  return (
    <>
      {state?.isExchangeSession && controller ? (
        <button
          type="button"
          className="checkout__button"
          onClick={handleProceed}
          disabled={!state.cartId}
        >
          Proceed with exchange
        </button>
      ) : cart?.checkoutUrl ? (
        <a className="checkout__button" href={cart.checkoutUrl}>
          Check out
        </a>
      ) : (
        <button type="button" className="checkout__button" disabled>
          Check out
        </button>
      )}
      {testModeOpen && <TestModeModal action="proceed" onClose={() => setTestModeOpen(false)} />}
    </>
  );
}
