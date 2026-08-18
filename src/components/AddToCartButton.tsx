"use client";

import React, { useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { ShoppingCart, Loader2 } from "lucide-react";

export function AddToCartButton({
  variantId,
  availableForSale = true,
  className = "",
}: {
  variantId: string;
  availableForSale?: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!variantId) return;
    startTransition(async () => {
      try {
        await addToCart(variantId);
      } catch (err) {
        console.error("Error adding item to cart:", err);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!availableForSale || isPending}
      className={`bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Adding...
        </>
      ) : !availableForSale ? (
        "Sold Out"
      ) : (
        <>
          <ShoppingCart size={16} />
          Add to Cart
        </>
      )}
    </button>
  );
}

export default AddToCartButton;
