"use client";

/**
 * Dummy-store wiring for the copied PostCo status-bar template.
 *
 * This is the store-owned glue: it builds a `CartAdapter` over the in-memory
 * `cartStore` and boots the SDK. The SDK resolves the real exchange session
 * from PostCo's redirect query params (first landing) or its own cache (later
 * pages). If there is no session, the bar simply does not render — exactly how
 * a production storefront behaves. No demo/test-mode fallback: a synthetic
 * test-mode session gets persisted and would later be read back as if real,
 * so Proceed/Cancel would point at the placeholder return center.
 */

import { useEffect, useState } from "react";
import { initExchange, type CartAdapter, type ExchangeController } from "@postco/headless-exchange-sdk";
// import { type TestMode } from "@postco/headless-exchange-sdk"; // uncomment for DEMO_TEST_MODE below
import { cartStore } from "@/cart/cartStore";
import { PostcoStatusBar } from "./PostcoStatusBar";

// The dummy store keeps its cart in `cartStore`; this maps 1:1 onto the SDK's
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
// Uncomment DEMO_TEST_MODE + the `testMode` fallback in the effect below to
// render the status bar on a plain store visit — no return center → online
// store loop needed. Best for styling the bar or checking the credit math in
// isolation.
//
// In test mode the SDK never redirects; Proceed/Cancel end the session (the bar
// drops) and the status bar / checkout button show the TestModeModal.
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

export function ExchangeStatusBar() {
  const [controller, setController] = useState<ExchangeController | null>(null);

  useEffect(() => {
    const c = initExchange({ cart: adapter, debug: true });
    // No real exchange session -> nothing to show. Tear the controller down so
    // we never persist or render a placeholder session.
    if (!c.getSession()) {
      c.destroy();
      // --- DEV-ONLY: uncomment (with DEMO_TEST_MODE above) to preview the bar
      // without a real handoff. In test mode the SDK ends the session (bar
      // drops) instead of redirecting and shows its own built-in test-mode
      // modal. ---
      // const demo = initExchange({ cart: adapter, testMode: DEMO_TEST_MODE, debug: true });
      // setController(demo);
      // return () => demo.destroy();
      return;
    }
    setController(c);
    return () => c.destroy();
  }, []);

  if (!controller) return null;
  return <PostcoStatusBar controller={controller} />;
}
