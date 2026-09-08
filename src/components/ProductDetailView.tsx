"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatMoney } from "@/lib/money";
import type { ProductDetail, ProductImage } from "@/lib/shopify/types";

function optionsFromVariant(product: ProductDetail) {
  const first = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
  const selected: Record<string, string> = {};
  for (const option of first?.selectedOptions ?? []) {
    selected[option.name] = option.value;
  }
  return selected;
}

function findVariant(product: ProductDetail, selected: Record<string, string>) {
  return (
    product.variants.find((variant) =>
      variant.selectedOptions.every((option) => selected[option.name] === option.value),
    ) ?? null
  );
}

function showOptionPicker(product: ProductDetail) {
  return product.variants.length > 1 || product.variants.some((variant) => variant.title !== "Default Title");
}

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const [selected, setSelected] = useState<Record<string, string>>(() => optionsFromVariant(product));
  const [image, setImage] = useState<ProductImage | null>(product.featuredImage ?? product.images[0] ?? null);
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(() => findVariant(product, selected), [product, selected]);
  const displayImage = variant?.image ?? image;
  const price = variant?.price ?? product.variants[0]?.price;

  function selectOption(name: string, value: string) {
    const next = { ...selected, [name]: value };
    setSelected(next);
    const match = findVariant(product, next);
    if (match?.image) {
      setImage(match.image);
    }
  }

  return (
    <div className="pdp">
      <div className="pdp__gallery">
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="pdp__image" src={displayImage.url} alt={displayImage.altText ?? product.title} />
        ) : (
          <div className="pdp__image pdp__image--placeholder" aria-hidden>
            <span>{product.title.slice(0, 1)}</span>
          </div>
        )}
        {product.images.length > 1 ? (
          <div className="pdp__thumbs">
            {product.images.map((thumb) => (
              <button
                key={thumb.url}
                type="button"
                className={thumb.url === displayImage?.url ? "is-active" : undefined}
                onClick={() => setImage(thumb)}
                aria-label="View product image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb.url} alt={thumb.altText ?? ""} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pdp__info">
        <h1>{product.title}</h1>
        {price ? <p className="pdp__price">{formatMoney(price)}</p> : null}

        {showOptionPicker(product)
          ? product.options.map((option) => (
              <fieldset key={option.name} className="pdp__options">
                <legend>{option.name}</legend>
                <div className="pdp__chips">
                  {option.values.map((value) => {
                    const isSelected = selected[option.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={isSelected ? "is-selected" : undefined}
                        onClick={() => selectOption(option.name, value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))
          : null}

        <div className="pdp__qty">
          <span>Quantity</span>
          <div className="qty-stepper">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">
              +
            </button>
          </div>
        </div>

        {variant && !variant.availableForSale ? <p className="error">This variant is sold out.</p> : null}

        <AddToCartButton
          variantId={variant?.id ?? ""}
          quantity={quantity}
          disabled={!variant || !variant.availableForSale}
        />

        {product.descriptionHtml ? (
          <div className="pdp__description" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        ) : product.description ? (
          <p className="pdp__description">{product.description}</p>
        ) : null}
      </div>
    </div>
  );
}
