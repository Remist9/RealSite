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
