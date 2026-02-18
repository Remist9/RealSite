import { API_URL } from "../config.js";
import { apiFetch } from "../api.js";

export async function getAdminActiveOrders() {
  return apiFetch(`${API_URL}/admin/order/active`);
}

export async function delUserActiveOrder(orderId) {
  return apiFetch(`${API_URL}/admin/order/active/${orderId}`, {
    method: "DELETE",
  });
}

export async function patchUserActiveOrder(orderId) {
  return apiFetch(`${API_URL}/admin/order/active/${orderId}`, {
    method: "PATCH",
  });
}
