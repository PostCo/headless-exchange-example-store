# Headless exchange example store

A small Next.js storefront that shows how to wire up
[`@postco/headless-exchange-sdk`](https://www.npmjs.com/package/@postco/headless-exchange-sdk)
on a headless Shopify store. It talks to Shopify through the Storefront API,
lets a shopper build a cart, and hands that cart back to the PostCo return
center to finish an exchange.

Use it as a reference: copy the cart adapter, the status bar, and the checkout
wiring into your own store. The step-by-step guide (with a video of the full
loop) walks through this repo file by file:
**[docs.postco.co/headless-exchange-sdk](https://docs.postco.co/headless-exchange-sdk)**.

## Run

```bash
cp .env.local.example .env.local
# paste your store domain + public Storefront token into .env.local
npm install
npm run dev
```

Open [http://localhost:3005](http://localhost:3005).

## Credentials

The store only reads public Storefront values (`NEXT_PUBLIC_*`). They are not
secrets, but do not commit `.env.local`.

1. In Shopify admin: **Settings → Apps and sales channels → Develop apps**.
2. Create an app (or open an existing custom app) and turn on **Storefront API**
   access.
3. Enable product and cart scopes, for example:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_checkouts`
4. Install the app and copy the **Storefront API access token**.
5. Set:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-public-storefront-token
```

Without real values, `npm install`, `npm run dev`, and `npm run build` still
work. The product list and add-to-cart calls will show a setup or Storefront
error, which is expected.

## Where the SDK is wired

In the order you'd add them to your own store:

| File | Role |
| --- | --- |
| `src/cart/cartStore.ts` | The cart store (source of truth). Persists to `localStorage`; `hydrate()` re-fetches the live cart on load because PostCo empties it after an exchange. |
| `src/exchange/ExchangeProvider.tsx` | Builds the `CartAdapter` over `cartStore`, calls `initExchange` **once**, and shares `{ controller, state }` via context (`useExchange()`). |
| `src/app/layout.tsx` | Mounts `ExchangeProvider` and renders `ExchangeStatusBar` inside it. |
| `src/components/PostcoStatusBar.tsx` | The copied status-bar template (`npx @postco/headless-exchange-sdk add status-bar`). Restyle freely; the exchange math stays in the package. |
| `src/components/ExchangeStatusBar.tsx` | Renders the template from the shared controller. |
| `src/components/CheckoutButton.tsx` | Checkout override: when `state.isExchangeSession` is true it calls `controller.proceedToExchange()` instead of Shopify checkout. |

## Test mode

To see the status bar without a real return-center handoff, open
`src/exchange/ExchangeProvider.tsx`, uncomment `DEMO_TEST_MODE`, and swap the
`initExchange` line for the one that passes `testMode`. The bar then shows on
any visit. Proceed and Cancel show the SDK's built-in test-mode modal instead
of redirecting.

Re-comment it when you're done, and clear the `postco:exchange-session` key
from `localStorage`. A test session is persisted like a real one.

## Verify

```bash
npm run build
npm run lint
```
