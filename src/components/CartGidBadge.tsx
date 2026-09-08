"use client";

import { useSyncExternalStore } from "react";
import { cartStore } from "@/cart/cartStore";

export function CartGidBadge() {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);

  return (
    <details className="gid-badge">
      <summary>SDK cart GID (must include ?key=)</summary>
      <code>{cart?.id ?? "No cart yet — add a variant first."}</code>
    </details>
  );
}
