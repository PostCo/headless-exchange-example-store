/**
 * Shared cart selection. `id` must include the Storefront `?key=` query —
 * do not transform this field. `cost.totalAmount` is the SDK snapshot contract.
 */
export const CART_SELECTION = `
  id
  checkoutUrl
  cost {
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 250) {
    edges {
      node {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            product {
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = `
  query Products {
    products(first: 50) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      featuredImage {
        url
        altText
      }
      images(first: 12) {
        nodes {
          url
          altText
        }
      }
      options {
        name
        values
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          image {
            url
            altText
          }
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

export const CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_SELECTION}
    }
  }
`;
