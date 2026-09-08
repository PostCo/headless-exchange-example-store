"use client";

/**
 * Dummy-store wiring for the copied PostCo status-bar template.
 *
 * This is the store-owned glue: it builds a `CartAdapter` over the in-memory
 * `cartStore` and boots the SDK. When PostCo's redirect query params are present
 * on the URL, the SDK resolves the real session from them; otherwise it falls
 * back to a DEMO session so the bar still renders locally. A production
 * storefront would just call `initExchange()` and let the SDK resolve the URL.
 */

import { useEffect, useState } from "react";
import { initExchange, type CartAdapter, type ExchangeController, type TestMode } from "@postco/headless-exchange-sdk";
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

// Demo credit values so the bar is visible on the local store without a PostCo
// redirect. `testMode` synthesizes the ExchangeSession from these (dev-only).
const DEMO_TEST_MODE: TestMode = {
  initialExchangeCredit: "50.00",
  bonusCredit: "5.00",
  currency: "USD",
  exchangeSubmissionPath: "https://returns.example.com/exchange/submit",
};

export function ExchangeStatusBar() {
  const [controller, setController] = useState<ExchangeController | null>(null);

  useEffect(() => {
    // If PostCo redirected here with session query params, let the SDK resolve
    // the real session from them. Otherwise fall back to a local testMode.
    const hasRedirectSession =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).has("storefrontToken");
    const c = hasRedirectSession
      ? initExchange({ cart: adapter, debug: true })
      : initExchange({ cart: adapter, testMode: DEMO_TEST_MODE, debug: true });
    setController(c);
    return () => c.destroy();
  }, []);

  if (!controller) return null;
  return <PostcoStatusBar controller={controller} />;
}
