import { API_URL } from "../config.js";
import { apiFetch } from "../api.js";

export function getMyProfile() {
  return apiFetch(`${API_URL}/profile/me`);
}

export function updateMyProfile(data) {
  return apiFetch(`${API_URL}/profile/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function addUserAddress(address) {
  return apiFetch(`${API_URL}/profile/address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });
}

export async function getUserAddress() {
  return await apiFetch(`${API_URL}/profile/address`);
}

export async function deleteUserAddress(addressId) {
  return await apiFetch(`${API_URL}/profile/address/${addressId}`, {
    method: "DELETE",
  });
}

export async function updateUserAddress(addressId, address) {
  return await apiFetch(`${API_URL}/profile/address/${addressId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });
}

export async function getUserActiveOrders() {
  return apiFetch(`${API_URL}/profile/orders/active`);
}

export async function getUserCompletedOrders() {
  return apiFetch(`${API_URL}/profile/orders/completed`);
}

export async function getUserSummary() {
  return apiFetch(`${API_URL}/profile/orders/completed/summary`);
}
