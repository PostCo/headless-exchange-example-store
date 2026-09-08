import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailView } from "@/components/ProductDetailView";
import { fetchProductByHandle } from "@/lib/shopify/api";
import { getShopifyEnv } from "@/lib/shopify/client";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  if (!getShopifyEnv()) {
    return { title: "Product" };
  }
  const { handle } = await params;
  try {
    const product = await fetchProductByHandle(handle);
    return { title: product?.title ?? "Product" };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  if (!getShopifyEnv()) {
    return (
      <div className="notice">
        <p>
          Shopify credentials are not set. Copy <code>.env.local.example</code> to <code>.env.local</code>.
        </p>
      </div>
    );
  }

  let product;
  try {
    product = await fetchProductByHandle(handle);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storefront request failed.";
    return <p className="error">{message}</p>;
  }

  if (!product) {
    notFound();
  }

  return (
    <article className="product-page">
      <nav className="breadcrumb">
        <Link href="/">Shop</Link>
        <span aria-hidden>/</span>
        <span>{product.title}</span>
      </nav>
      <ProductDetailView product={product} />
    </article>
  );
}
