"use client";

import Link from "next/link";
import { useCart } from "@/cart/CartContext";
import { CartGidBadge } from "@/components/CartGidBadge";
import { CheckoutButton } from "@/components/CheckoutButton";
import { formatMoney } from "@/lib/money";

export default function CartPage() {
  const { cart, removeLine, clearCart, pending } = useCart();
  const isEmpty = !cart || cart.lines.length === 0;

  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <h1>Your cart</h1>
        {!isEmpty ? (
          <button type="button" className="cart-clear" onClick={() => void clearCart()} disabled={pending}>
            Clear cart
          </button>
        ) : null}
      </div>
      {isEmpty ? (
        <div className="cart-empty">
          <p className="cart-empty__title">Your cart is empty</p>
          <p className="lede">Add a product and it will show up here.</p>
          <Link className="checkout__button" href="/">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-lines">
            {cart.lines.map((line) => {
              const title = line.merchandise.productTitle ?? line.merchandise.title;
              const variantTitle = line.merchandise.title !== "Default Title" ? line.merchandise.title : null;

              return (
                <li key={line.id} className="cart-line">
                  {line.merchandise.image ? (
                    // Shopify CDN hosts vary by shop; a plain img avoids next/image remote config.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="cart-line__image"
                      src={line.merchandise.image.url}
                      alt={line.merchandise.image.altText ?? title}
                    />
                  ) : (
                    <div className="cart-line__image cart-line__image--placeholder" />
                  )}
                  <div className="cart-line__details">
                    <h2>{title}</h2>
                    {variantTitle ? <p className="cart-line__variant">{variantTitle}</p> : null}
                    <p className="cart-line__qty">Qty {line.quantity}</p>
                  </div>
                  <p className="cart-line__price">{formatMoney(line.cost)}</p>
                  <button
                    type="button"
                    className="cart-line__remove"
                    aria-label={`Remove ${title} from cart`}
                    onClick={() => void removeLine(line.id)}
                    disabled={pending}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
          <aside className="cart-summary">
            <h2>Order summary</h2>
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <strong>{formatMoney(cart.cost.totalAmount)}</strong>
            </div>
            <p className="hint">Taxes and shipping are calculated at Shopify checkout.</p>
            <CheckoutButton />
          </aside>
        </div>
      )}
      <CartGidBadge />
    </div>
  );
}
