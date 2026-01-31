import { API_URL } from "../config.js";

export async function fetchCatalogByCategories(filters = {}) {
  try {
    const response = await fetch(`${API_URL}/catalog/filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters), // 🔥 БЕЗ categories
    });

    if (!response.ok) {
      throw new Error("Ошибка загрузки каталога");
    }

    return await response.json();
  } catch (err) {
    console.error("Catalog API error:", err);
    throw err;
  }
}
