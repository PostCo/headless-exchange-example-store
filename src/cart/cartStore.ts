"use client";

import { fetchCart } from "@/lib/shopify/api";
import type { CartSnapshot } from "@/lib/shopify/types";

type Listener = () => void;

const STORAGE_KEY = "example-store-cart";

function load(): CartSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartSnapshot) : null;
  } catch {
    return null; // corrupt or blocked storage: start empty
  }
}

let snapshot: CartSnapshot | null = load();
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

// A real store persists the cart so it survives reloads and is shared across
// tabs. We save the whole snapshot to localStorage and mirror changes from
// other tabs via the `storage` event.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = load();
    emit();
  });
}

/**
 * External cart store the SDK reads via dependency injection:
 *
 *   initExchange({
 *     cart: {
 *       getCart: () => cartStore.getSnapshot(),
 *       subscribe: (cb) => cartStore.subscribe(cb),
 *       clearCart: () => cartStore.setSnapshot(null),
 *     },
 *   })
 *
 * The SDK must not import this module — ExchangeProvider.tsx passes these
 * functions in as the CartAdapter.
 */
export const cartStore = {
  getSnapshot: (): CartSnapshot | null => snapshot,
  // Server renders with an empty cart (no localStorage there). Hydration must
  // match that, then useSyncExternalStore re-reads getSnapshot on the client.
  getServerSnapshot: (): CartSnapshot | null => null,
  subscribe: (cb: Listener): (() => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  setSnapshot: (next: CartSnapshot | null) => {
    snapshot = next;
    if (typeof window !== "undefined") {
      try {
        if (next) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // storage full or blocked: keep the in-memory value, skip persistence
      }
    }
    emit();
  },
  // Re-fetch the live cart from Shopify by its stored id. The saved snapshot is
  // only a fast first paint; Shopify is the source of truth. This is what keeps
  // the cart honest: when the return center empties it after an exchange, the
  // next load reflects that instead of showing the old items.
  hydrate: async (): Promise<void> => {
    const id = snapshot?.id;
    if (typeof window === "undefined" || !id) return;
    try {
      cartStore.setSnapshot(await fetchCart(id));
    } catch {
      // Network error: keep the cached snapshot rather than wiping the cart.
    }
  },
};

export type CartStore = typeof cartStore;
