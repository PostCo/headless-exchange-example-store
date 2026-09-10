"use client";

/**
 * Renders the copied PostCo status-bar template using the SHARED exchange
 * controller from `ExchangeProvider`. The SDK is booted once at the layout
 * level — this component just consumes it. `PostcoStatusBar` renders nothing
 * when there is no active exchange session, so no gating is needed here.
 */

import { useExchange } from "@/exchange/ExchangeProvider";
import { PostcoStatusBar } from "./PostcoStatusBar";

export function ExchangeStatusBar() {
  const { controller } = useExchange();
  if (!controller) return null;
  return <PostcoStatusBar controller={controller} />;
}
