import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/shopify/api";
import { getShopifyEnv } from "@/lib/shopify/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!getShopifyEnv()) {
    return (
      <>
        <section className="hero">
          <p className="eyebrow">Sunday Supply</p>
          <h1>Shop</h1>
        </section>
        <div className="notice">
          <p>
            Shopify credentials are not set. Copy <code>.env.local.example</code> to <code>.env.local</code>, paste a
            store domain and public Storefront token, then restart <code>npm run dev</code>.
          </p>
        </div>
      </>
    );
  }

  let products;
  try {
    products = await fetchProducts();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storefront request failed.";
    return (
      <>
        <section className="hero">
          <h1>Shop</h1>
        </section>
        <p className="error">{message}</p>
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Catalog</p>
        <h1>Shop</h1>
        <p className="lede">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </section>
      {products.length === 0 ? (
        <p className="empty">No products in this store yet.</p>
      ) : (
        <section className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </>
  );
}
