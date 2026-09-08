/**
 * Canonical Shopify money shape (`{ amount, currencyCode }`) used across the
 * Storefront types. Re-exported from the top-level money util so there is a
 * single source of truth for the shape and its formatters.
 */
export type { Money } from "@/lib/money";
export { formatMoney, formatPriceRange } from "@/lib/money";
