import { createStorefrontApiClient } from "@shopify/storefront-api-client";

// Shared factory for the Shopify Storefront API client. ALWAYS use this instead of calling
// `createStorefrontApiClient` from "@shopify/storefront-api-client" directly.
//
// Why: the library defaults its `customFetchApi` option to the bare global `fetch`. That default
// reference breaks in the minified production retailer bundle -- the request throws and the client
// surfaces a misleading `Cannot read properties of undefined (reading 'get')`, which masks menu /
// collection / product lookups as "not found" in production only (dev works). Passing an explicit
// wrapper that calls `fetch` from app scope keeps the Storefront calls working after minification.
// See PC-10041.
const STOREFRONT_API_VERSION = "2025-10";

const storefrontFetch = (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> => fetch(...args);

export function createStorefrontClient(storeDomain: string, publicAccessToken: string) {
  return createStorefrontApiClient({
    storeDomain,
    apiVersion: STOREFRONT_API_VERSION,
    publicAccessToken,
    customFetchApi: storefrontFetch,
  });
}

export function getShopifyEnv(): { storeDomain: string; publicAccessToken: string } | null {
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  const publicAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN?.trim();

  if (
    !storeDomain ||
    !publicAccessToken ||
    storeDomain === "your-store.myshopify.com" ||
    publicAccessToken === "your-public-storefront-token"
  ) {
    return null;
  }

  return { storeDomain, publicAccessToken };
}

export function getStorefrontClient() {
  const env = getShopifyEnv();
  if (!env) {
    throw new Error(
      "Missing Shopify credentials. Copy .env.local.example to .env.local and set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN.",
    );
  }

  return createStorefrontClient(env.storeDomain, env.publicAccessToken);
}
