import { shopifyFetch } from "./shopify";
import {
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  GET_CART_QUERY,
} from "./shopify-queries";
import type { Cart } from "./shopify-types";

let inMemoryCartId: string | null = null;

async function getCartId(): Promise<string | undefined> {
  if (typeof window !== "undefined") {
    return localStorage.getItem("dcp_shopify_cart_id") || undefined;
  }
  return inMemoryCartId || undefined;
}

async function setCartId(cartId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("dcp_shopify_cart_id", cartId);
  }
  inMemoryCartId = cartId;
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId();
  if (!cartId) return null;

  try {
    const data = await shopifyFetch<{ cart: Cart | null }>(GET_CART_QUERY, {
      cartId,
    });
    return data.cart;
  } catch (err) {
    console.error("Failed to get cart:", err);
    return null;
  }
}

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: Cart } }>(
    CREATE_CART_MUTATION
  );

  const cart = data.cartCreate.cart;
  await setCartId(cart.id);
  return cart;
}

export async function addToCart(variantId: string): Promise<Cart> {
  let cartId = await getCartId();

  if (!cartId) {
    const cart = await createCart();
    cartId = cart.id;
  }

  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>(
    ADD_TO_CART_MUTATION,
    {
      cartId,
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    }
  );

  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  lineId: string,
  quantity: number
): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) throw new Error("No cart found");

  const data = await shopifyFetch<{ cartLinesUpdate: { cart: Cart } }>(
    UPDATE_CART_MUTATION,
    {
      cartId,
      lines: [{ id: lineId, quantity }],
    }
  );

  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(lineId: string): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) throw new Error("No cart found");

  const data = await shopifyFetch<{ cartLinesRemove: { cart: Cart } }>(
    REMOVE_FROM_CART_MUTATION,
    {
      cartId,
      lineIds: [lineId],
    }
  );

  return data.cartLinesRemove.cart;
}
