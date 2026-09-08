import type { Money } from "./money";

export type { Money };

export type ProductImage = {
  url: string;
  altText: string | null;
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: Money;
  merchandise: {
    id: string;
    title: string;
    productTitle?: string;
    image: ProductImage | null;
    price: Money | null;
  };
};

/**
 * Cart shape the future Headless Storefront Exchange SDK reads via
 * `getCart: () => cartStore.getSnapshot()`.
 *
 * `id` is the full Storefront cart GID including `?key=`
 * (`gid://shopify/Cart/<token>?key=<secret>`). Never strip or encode it.
 *
 * `checkoutUrl` is Shopify's hosted checkout for this cart.
 */
export type CartSnapshot = {
  id: string;
  checkoutUrl: string;
  cost: {
    totalAmount: Money;
  };
  lines: CartLine[];
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  featuredImage: ProductImage | null;
  minPrice: Money;
  maxPrice: Money;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  image: ProductImage | null;
  price: Money;
  selectedOptions: Array<{ name: string; value: string }>;
};

export type ProductDetail = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
};

/** Raw Storefront cart payload (query + cartCreate/cartLinesAdd). */
export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: {
    totalAmount: Money;
  };
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        cost?: {
          totalAmount: Money;
        };
        merchandise: {
          id?: string;
          title?: string;
          image?: ProductImage | null;
          price?: Money | null;
          product?: {
            title: string;
            featuredImage?: ProductImage | null;
          };
        };
      };
    }>;
  };
};

export type ShopifyUserError = {
  field?: string[] | null;
  message: string;
};
