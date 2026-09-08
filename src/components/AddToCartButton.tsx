"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/cart/CartContext";

export function AddToCartButton({
  variantId,
  quantity = 1,
  disabled = false,
}: {
  variantId: string;
  quantity?: number;
  disabled?: boolean;
}) {
  const { addVariant, pending } = useCart();
  const [status, setStatus] = useState<"idle" | "added" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const isDisabled = disabled || pending || !variantId;

  async function handleClick() {
    setStatus("idle");
    setMessage(null);
    try {
      await addVariant(variantId, quantity);
      setStatus("added");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not add to cart.");
    }
  }

  return (
    <div className="add-to-cart">
      <button type="button" onClick={handleClick} disabled={isDisabled}>
        {pending ? "Adding…" : "Add to cart"}
      </button>
      {status === "added" ? (
        <p className="hint">
          Added. <Link href="/cart">View cart</Link>
        </p>
      ) : null}
      {status === "error" && message ? <p className="error">{message}</p> : null}
    </div>
  );
}
