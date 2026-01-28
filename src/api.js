import { showAuthModal } from "./auth/auth_btn.js";

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401) {
    showAuthModal();
    throw new Error("AUTH_REQUIRED");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Ошибка запроса");
  }

  return res.json();
}
