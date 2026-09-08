# Headless exchange example store

A small Next.js storefront that shows how to wire up
[`@postco/headless-exchange-sdk`](https://www.npmjs.com/package/@postco/headless-exchange-sdk)
on a headless Shopify store. It talks to Shopify through the Storefront API,
lets a shopper build a cart, and hands that cart back to the PostCo return
center to finish an exchange.

Use it as a reference: copy the cart adapter, the status bar, and the checkout
wiring into your own store.

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

- `src/cart/cartStore.ts` — the cart store (source of truth). It persists to
  `localStorage`, so the cart survives reloads and is shared across tabs, like a
  real store.
- `src/components/ExchangeStatusBar.tsx` — builds the `CartAdapter`, calls
  `initExchange`, and renders the status bar.
- `src/components/PostcoStatusBar.tsx` — the copyable status-bar UI.

## Verify

```bash
npm run build
npm run lint
```
