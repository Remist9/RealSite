import { API_URL } from "../config.js";
import { apiFetch } from "../api.js";

/**
 * Универсальное обновление корзины
 * delta: +1 / -1
 * backend возвращает актуальное quantity
 */
export function updateCart(productId, delta) {
  return apiFetch(`${API_URL}/cart/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      delta,
    }),
  });
}

export function fetchCartRaw() {
  return apiFetch(`${API_URL}/cart/raw`);
}

export function fetchCart() {
  return apiFetch(`${API_URL}/cart/cart`);
}
