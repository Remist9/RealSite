import { API_URL } from "../config.js";

export async function getMyProfile() {
  const res = await fetch(`${API_URL}/profile/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Не удалось загрузить профиль");
  }

  return res.json(); // { login: "oleg" }
}

export async function updateMyProfile(data) {
  const res = await fetch(`${API_URL}/profile/me`, {
    method: "PATCH",
    credentials: "include", // ⬅️ важно для cookie
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Ошибка обновления профиля");
  }

  return res.json();
}
