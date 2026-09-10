import { getStorefrontClient } from "./client";
import { CART_CREATE, CART_LINES_ADD, CART_LINES_REMOVE } from "./mutations";
import { CART_QUERY, PRODUCT_BY_HANDLE_QUERY, PRODUCTS_QUERY } from "./queries";
import type {
  CartSnapshot,
  Product,
  ProductDetail,
  ProductImage,
  ProductVariant,
  ShopifyCart,
  ShopifyUserError,
} from "./types";

type GraphQLError = { message: string };

type StorefrontResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

function assertData<T>(response: StorefrontResponse<T>, fallback: string): T {
  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join("; "));
  }
  if (!response.data) {
    throw new Error(fallback);
  }
  return response.data;
}

function assertNoUserErrors(userErrors: ShopifyUserError[] | undefined) {
  if (userErrors?.length) {
    throw new Error(userErrors.map((error) => error.message).join("; "));
  }
}

export function mapCartToSnapshot(cart: ShopifyCart): CartSnapshot {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    cost: {
      totalAmount: {
        amount: cart.cost.totalAmount.amount,
        currencyCode: cart.cost.totalAmount.currencyCode,
      },
    },
    lines: cart.lines.edges.map(({ node }) => {
      const price = node.merchandise.price ?? null;
      const lineCost =
        node.cost?.totalAmount ??
        (price
          ? {
              amount: (Number(price.amount) * node.quantity).toFixed(2),
              currencyCode: price.currencyCode,
            }
          : { amount: "0.0", currencyCode: cart.cost.totalAmount.currencyCode });

      return {
        id: node.id,
        quantity: node.quantity,
        cost: lineCost,
        merchandise: {
          id: node.merchandise.id ?? "",
          title: node.merchandise.title ?? "Variant",
          productTitle: node.merchandise.product?.title,
          image: node.merchandise.image ?? node.merchandise.product?.featuredImage ?? null,
          price,
        },
      };
    }),
  };
}

type ProductsResponse = {
  products: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      featuredImage: ProductImage | null;
      priceRange: {
        minVariantPrice: { amount: string; currencyCode: string };
        maxVariantPrice: { amount: string; currencyCode: string };
      };
    }>;
  };
};

export async function fetchProducts(): Promise<Product[]> {
  const client = getStorefrontClient();
  const response = (await client.request(PRODUCTS_QUERY)) as StorefrontResponse<ProductsResponse>;
  const data = assertData(response, "Storefront PRODUCTS_QUERY returned no data.");

  return data.products.nodes.map((product) => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    featuredImage: product.featuredImage,
    minPrice: product.priceRange.minVariantPrice,
    maxPrice: product.priceRange.maxVariantPrice,
  }));
}

type ProductByHandleResponse = {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    featuredImage: ProductImage | null;
    images: { nodes: ProductImage[] };
    options: Array<{ name: string; values: string[] }>;
    variants: {
      nodes: Array<{
        id: string;
        title: string;
        availableForSale: boolean;
        image: ProductImage | null;
        price: { amount: string; currencyCode: string };
        selectedOptions: Array<{ name: string; value: string }>;
      }>;
    };
  } | null;
};

export async function fetchProductByHandle(handle: string): Promise<ProductDetail | null> {
  const client = getStorefrontClient();
  const response = (await client.request(PRODUCT_BY_HANDLE_QUERY, {
    variables: { handle },
  })) as StorefrontResponse<ProductByHandleResponse>;
  const data = assertData(response, "Storefront PRODUCT_BY_HANDLE_QUERY returned no data.");
  if (!data.product) {
    return null;
  }

  const product = data.product;
  const variants: ProductVariant[] = product.variants.nodes.map((variant) => ({
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    image: variant.image,
    price: variant.price,
    selectedOptions: variant.selectedOptions,
  }));

  const images = product.images.nodes;
  const featuredImage = product.featuredImage ?? images[0] ?? null;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    featuredImage,
    images: images.length > 0 ? images : featuredImage ? [featuredImage] : [],
    options: product.options.filter((option) => option.values.length > 0),
    variants,
  };
}

type CartCreateResponse = {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
};

type CartLinesAddResponse = {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
};

type CartLinesRemoveResponse = {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
};

type CartQueryResponse = {
  cart: ShopifyCart | null;
};

/**
 * Re-fetch the live cart from Shopify by its GID. Returns null when the cart no
 * longer exists (expired). An emptied cart comes back with `lines: []`.
 *
 * The return center empties the Shopify cart (cartLinesRemove) right after it
 * creates an exchange, so a store must re-fetch to see that — a cached local
 * snapshot would show stale items on the shopper's next exchange.
 */
export async function fetchCart(cartId: string): Promise<CartSnapshot | null> {
  const client = getStorefrontClient();
  const response = (await client.request(CART_QUERY, {
    variables: { cartId },
  })) as StorefrontResponse<CartQueryResponse>;
  const data = assertData(response, "Storefront cart query returned no data.");
  return data.cart ? mapCartToSnapshot(data.cart) : null;
}

export async function createCart(variantId: string, quantity: number): Promise<CartSnapshot> {
  const client = getStorefrontClient();
  const response = (await client.request(CART_CREATE, {
    variables: {
      input: {
        lines: [{ merchandiseId: variantId, quantity }],
      },
    },
  })) as StorefrontResponse<CartCreateResponse>;

  const data = assertData(response, "Storefront cartCreate returned no data.");
  assertNoUserErrors(data.cartCreate.userErrors);
  if (!data.cartCreate.cart) {
    throw new Error("Storefront cartCreate did not return a cart.");
  }
  return mapCartToSnapshot(data.cartCreate.cart);
}

export async function addCartLines(cartId: string, variantId: string, quantity: number): Promise<CartSnapshot> {
  const client = getStorefrontClient();
  const response = (await client.request(CART_LINES_ADD, {
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
  })) as StorefrontResponse<CartLinesAddResponse>;

  const data = assertData(response, "Storefront cartLinesAdd returned no data.");
  assertNoUserErrors(data.cartLinesAdd.userErrors);
  if (!data.cartLinesAdd.cart) {
    throw new Error("Storefront cartLinesAdd did not return a cart.");
  }
  return mapCartToSnapshot(data.cartLinesAdd.cart);
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<CartSnapshot> {
  const client = getStorefrontClient();
  const response = (await client.request(CART_LINES_REMOVE, {
    variables: { cartId, lineIds },
  })) as StorefrontResponse<CartLinesRemoveResponse>;

  const data = assertData(response, "Storefront cartLinesRemove returned no data.");
  assertNoUserErrors(data.cartLinesRemove.userErrors);
  if (!data.cartLinesRemove.cart) {
    throw new Error("Storefront cartLinesRemove did not return a cart.");
  }
  return mapCartToSnapshot(data.cartLinesRemove.cart);
}
