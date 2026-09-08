"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { cartStore } from "@/cart/cartStore";

export function SiteNav() {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);
  const count = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;

  return (
    <nav>
      <Link href="/">Shop</Link>
      <Link href="/cart" className="cart-nav">
        Cart
        {count > 0 ? <span className="cart-nav__count">{count}</span> : null}
      </Link>
    </nav>
  );
}
