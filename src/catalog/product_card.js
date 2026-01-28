import { showProductCardFull } from "./product_card_full.js";

export function createProductCard(product) {
  const { title, cost } = product;
  const card = document.createElement("div");

  card.dataset.productCard = "true";

  card.className = `
    aspect-square bg-white rounded-lg shadow
    overflow-hidden flex flex-col
  `;

  card.innerHTML = `
    <div class="px-2 py-1">
      <span class="text-xs font-medium truncate block">
        ${title}
      </span>
    </div>

    <div class="flex-1 bg-gray-100 flex items-center justify-center">
      IMG
    </div>

    <div class="h-10 px-2 flex items-center">
      <span class="text-sm font-semibold mx-auto">
        ${cost} ₸
      </span>

      <button class="add-btn ml-auto w-7 h-7 rounded-full bg-green-500 text-white">
        +
      </button>
    </div>
  `;

  // ✅ ОДИН обработчик
  card.addEventListener("click", () => {
    if (window.isCatalogCategoriesOpen) return;
    showProductCardFull(product);
  });

  // + не открывает карточку
  card.querySelector(".add-btn").addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return card;
}
