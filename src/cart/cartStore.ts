"use client";

import type { CartSnapshot } from "@/lib/shopify/types";

type Listener = () => void;

let snapshot: CartSnapshot | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * External cart store the future SDK reads via dependency injection:
 *
 *   initExchange({
 *     getCart: () => cartStore.getSnapshot(),
 *     subscribe: (cb) => cartStore.subscribe(cb),
 *   })
 *
 * The SDK must not import this module — layout.tsx will pass these functions in.
 */
export const cartStore = {
  getSnapshot: (): CartSnapshot | null => snapshot,
  subscribe: (cb: Listener): (() => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  setSnapshot: (next: CartSnapshot | null) => {
    snapshot = next;
    emit();
  },
};

export type CartStore = typeof cartStore;
