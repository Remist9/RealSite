import { showProductCardFull } from "./product_card_full.js";
import { updateCart, fetchCartRaw } from "../cart/cart_api.js";

function isCatalogLocked() {
  return window.isCatalogCategoriesOpen === true;
}

export function createProductCard(
  product,
  { quantity = 0, isDesktop = false } = {},
) {
  const { name, cost } = product;
  const card = document.createElement("div");

  card.className = `
  bg-white
  border border-zinc-200
  rounded-2xl
  shadow-sm
  overflow-hidden
  flex flex-col

  w-full
  max-w-none

  sm:max-w-[240px]
  lg:max-w-[320px]

  h-fit

  transition-all duration-200
  hover:shadow-md
  hover:-translate-y-1
`;

  card.innerHTML = `
    <div class="px-2 py-1">
      <span class="text-xs font-medium truncate block">${name}</span>
    </div>

<div class="
  h-[120px]
  sm:h-[150px]
  lg:h-[190px]

  bg-gray-100
  flex items-center justify-center
  overflow-hidden
">
${
  product.image
    ? `<img src="http://${location.hostname}:8000/${product.image}" 
           alt="" 
           class="max-w-full max-h-full object-contain p-2" />`
    : `<div class="text-gray-400 text-xs">Нет фото</div>`
}
</div>

    <div class="h-10 px-2 flex items-center" data-role="card-bottom">
      <span class="text-sm font-semibold mx-auto">${cost} ₸</span>
      <button class="add-btn ml-auto w-7 h-7 rounded-full bg-green-500 text-white">+</button>
    </div>
  `;

  const bottom = card.querySelector("[data-role='card-bottom']");
  const addBtn = bottom.querySelector(".add-btn");

  /* ---------- открытие полной карточки ---------- */
  card.addEventListener("click", () => {
    if (window.isCatalogCategoriesOpen) return;
    showProductCardFull(product, { isDesktop });
  });

  /* ---------- первичное добавление ---------- */
  addBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    if (isCatalogLocked()) return;

    try {
      const res = await updateCart(product.id, +1);
      renderQuantityControls(res.quantity);
    } catch (e) {
      console.warn(e.message);
    }
  });

  /* ---------- UI ---------- */
  function renderQuantityControls(quantity) {
    bottom.innerHTML = `
      <div class="flex items-center w-full justify-between">
        <button data-action="decrease"
          class="w-7 h-7 rounded-full bg-gray-200 text-lg flex items-center justify-center">−</button>

        <div data-role="quantity"
          class="text-sm font-semibold text-gray-700">${quantity}</div>

        <button data-action="increase"
          class="w-7 h-7 rounded-full bg-green-500 text-white text-lg flex items-center justify-center">+</button>
      </div>
    `;
  }

  function restoreInitialControls() {
    bottom.innerHTML = `
    <span class="text-sm font-semibold mx-auto">${cost} ₸</span>
    <button class="add-btn ml-auto w-7 h-7 rounded-full bg-green-500 text-white">+</button>
  `;

    const btn = bottom.querySelector(".add-btn");
    if (!btn) return; // 🔒 защита от null

    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (isCatalogLocked()) return;

      const res = await updateCart(product.id, +1);
      renderQuantityControls(res.quantity);
    });
  }

  /* ---------- делегирование + / - ---------- */
  bottom.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (isCatalogLocked()) return;

    const action = e.target.dataset.action;
    if (!action) return;

    const delta = action === "increase" ? +1 : -1;

    try {
      await updateCart(product.id, delta);

      const cart = await fetchCartRaw();
      const quantity = cart.items?.[product.id] ?? 0;

      if (quantity === 0) {
        restoreInitialControls();
      } else {
        renderQuantityControls(quantity);
      }
    } catch (e) {
      console.warn(e.message);
    }
  });

  if (quantity > 0) {
    renderQuantityControls(quantity);
  }

  window.addEventListener("cart-updated", (e) => {
    const { productId, quantity } = e.detail;

    // если событие не для этой карточки
    if (productId !== product.id) return;

    if (quantity <= 0) {
      restoreInitialControls();
    } else {
      renderQuantityControls(quantity);
    }
  });

  return card;
}
