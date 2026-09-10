"use client";

/**
 * Store-owned glue that boots the Headless Exchange SDK exactly once and shares
 * the controller with the whole app.
 *
 * Init the SDK at a HIGH level (here, mounted in the root layout) so every
 * consumer — the status bar, the checkout button, anything else — reads the
 * SAME controller and the SAME live state. If each component called
 * `initExchange()` on its own it would get its own private session copy, and
 * ending the session in one place (Proceed/Cancel) would leave the others
 * showing stale state until a reload.
 *
 * The SDK resolves the real exchange session from PostCo's redirect query
 * params (first landing) or its own cache (later pages). With no session,
 * `state.isExchangeSession` is false and consumers render their normal UI.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initExchange, type CartAdapter, type ExchangeController, type ExchangeState } from "@postco/headless-exchange-sdk";
// import { type TestMode } from "@postco/headless-exchange-sdk"; // uncomment for DEMO_TEST_MODE below
import { cartStore } from "@/cart/cartStore";

// The store keeps its cart in `cartStore`; this maps 1:1 onto the SDK's
// CartAdapter. The SDK ships no default adapter, so every store builds one like
// this over wherever its own cart lives.
const adapter: CartAdapter = {
  getCart: () => cartStore.getSnapshot(),
  subscribe: (cb) => cartStore.subscribe(cb),
  clearCart: () => cartStore.setSnapshot(null),
};

// ---------------------------------------------------------------------------
// DEV-ONLY status-bar preview (commented out on purpose).
//
// Uncomment DEMO_TEST_MODE + the `testMode` option in `initExchange` below to
// render the status bar on a plain store visit — no return center → online
// store loop needed. Best for styling the bar or checking the credit math in
// isolation.
//
// In test mode the SDK never redirects; Proceed/Cancel end the session (the bar
// drops) and the SDK shows its own built-in test-mode modal.
//
// WARNING: leave it commented for real end-to-end testing. testMode synthesizes
// a session AND the SDK persists it to localStorage, so a later "real" load
// reads it back as if real and Proceed/Cancel go to returns.example.com.
// After using it, clear the `postco:exchange-session` localStorage key.
//
// const DEMO_TEST_MODE: TestMode = {
//   initialExchangeCredit: "50.00",
//   bonusCredit: "5.00",
//   currency: "USD",
//   exchangeSubmissionPath: "https://returns.example.com/exchange/submit",
// };
// ---------------------------------------------------------------------------

type ExchangeContextValue = {
  controller: ExchangeController | null;
  state: ExchangeState | null;
};

const ExchangeContext = createContext<ExchangeContextValue>({ controller: null, state: null });

export function ExchangeProvider({ children }: { children: ReactNode }) {
  const [controller, setController] = useState<ExchangeController | null>(null);
  const [state, setState] = useState<ExchangeState | null>(null);

  useEffect(() => {
    const c = initExchange({ cart: adapter, debug: true });
    // DEV-ONLY preview: swap the line above for the one below (with
    // DEMO_TEST_MODE uncommented) to force a synthetic test-mode session.
    // const c = initExchange({ cart: adapter, testMode: DEMO_TEST_MODE, debug: true });
    setController(c);
    // `subscribe` fires once immediately, then on every session/cart change.
    const unsub = c.subscribe(setState);
    return () => {
      unsub();
      c.destroy();
    };
  }, []);

  return <ExchangeContext.Provider value={{ controller, state }}>{children}</ExchangeContext.Provider>;
}

/** Read the shared exchange controller + live state. */
export function useExchange(): ExchangeContextValue {
  return useContext(ExchangeContext);
}
