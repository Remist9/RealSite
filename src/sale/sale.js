import { fetchCatalogByCategories } from "../catalog/catalog_api.js";
import { createProductCard } from "../catalog/product_card.js";
import { fetchCartRaw } from "../cart/cart_api.js";

let cartItems = {};

export function renderSale(main_box) {
  main_box.className = "flex-[11] overflow-hidden";

  main_box.innerHTML = `
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-auto">
        <div class="sale-grid p-2 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"></div>
      </div>
    </div>
  `;

  updateSale();
}

async function updateSale() {
  try {
    try {
      const cart = await fetchCartRaw();
      cartItems = cart.items || {};
    } catch {
      cartItems = {};
    }

    const data = await fetchCatalogByCategories({
      stock: ["all"], // ✅ ВСЕГДА акции
    });

    if (data?.items) renderItems(data.items);
  } catch (e) {
    console.warn(e);
  }
}

function renderItems(items) {
  const grid = document.querySelector(".sale-grid");
  if (!grid) return;

  grid.innerHTML = "";

  for (const [title, p] of Object.entries(items)) {
    const card = createProductCard(
      {
        title,
        cost: p.cost ?? "—",
        description: p.description ?? "",
        image: p.image || null,
        id: p.id,
        factory: p.factory,
        size: p.size,
      },
      { quantity: cartItems[p.id] ?? 0 },
    );

    grid.appendChild(card);
  }
}
