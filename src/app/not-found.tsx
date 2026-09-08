import Link from "next/link";

export default function NotFound() {
  return (
    <div className="cart-empty">
      <p className="cart-empty__title">Product not found</p>
      <p className="lede">That item is not in this catalog.</p>
      <Link className="checkout__button" href="/">
        Back to shop
      </Link>
    </div>
  );
}
