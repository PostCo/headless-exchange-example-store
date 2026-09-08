import Link from "next/link";
import { formatPriceRange } from "@/lib/money";
import type { Product } from "@/lib/shopify/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.handle}`} className="product-card">
      <div className="product-card__media">
        {product.featuredImage ? (
          // Shopify CDN hosts vary by shop; a plain img avoids next/image remote config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.featuredImage.url} alt={product.featuredImage.altText ?? product.title} />
        ) : (
          <div className="product-card__placeholder" aria-hidden>
            <span>{product.title.slice(0, 1)}</span>
          </div>
        )}
      </div>
      <div className="product-card__meta">
        <h2>{product.title}</h2>
        <p className="price">{formatPriceRange(product.minPrice, product.maxPrice)}</p>
      </div>
    </Link>
  );
}
