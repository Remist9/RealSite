import { updateCart } from "../cart/cart_api.js";

export function showProductCardFull(product) {
  const { title, description, cost, image } = product;

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/40 z-50 flex items-end";

  const sheet = document.createElement("div");
  sheet.className = `
    w-full bg-white rounded-t-2xl
    min-h-[70vh] max-h-[90vh]
    mx-auto lg:max-w-3xl
    transition-transform duration-300
    translate-y-0
    touch-pan-y
    overflow-hidden
    flex flex-col
  `;

  sheet.innerHTML = `
    <div class="w-10 h-1 bg-gray-300 rounded mx-auto my-3 shrink-0"></div>

    <div class="text-center mb-3 shrink-0 px-4">
      <h2 class="text-lg font-semibold text-gray-800">${title}</h2>
    </div>

    <div class="flex-1 overflow-auto px-4 pb-4">
      <div class="flex flex-col sm:flex-row gap-4">

        <div class="sm:w-2/5 w-full aspect-3/4 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
          ${
            image
              ? `<img src="${image}" class="w-full h-full object-cover" />`
              : `<span class="text-gray-400 text-sm">Нет изображения</span>`
          }
        </div>

        <div class="flex-1 flex flex-col gap-4">
          <div class="flex-1 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 flex items-center justify-center text-center">
            ${description || "Описание отсутствует"}
          </div>

          <div class="bg-gray-100 rounded-xl p-4 text-center text-base font-semibold">
            ${cost} ₸
          </div>
        </div>

      </div>
    </div>

    <!-- BOTTOM -->
    <div class="shrink-0 bg-white px-4 py-3" data-role="bottom">
      <div class="flex items-center justify-end">
        <button
          class="w-12 h-12 rounded-full bg-green-500 text-white text-2xl flex items-center justify-center"
          data-action="add"
        >+</button>
      </div>
    </div>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  const bottom = sheet.querySelector("[data-role='bottom']");

  /* ---------- UI ---------- */
  function renderQuantity(quantity) {
    bottom.innerHTML = `
      <div class="flex items-center justify-end gap-4">
        <button data-action="decrease"
          class="w-10 h-10 rounded-full bg-gray-200 text-xl flex items-center justify-center">−</button>

        <div class="text-lg font-semibold">${quantity}</div>

        <button data-action="increase"
          class="w-10 h-10 rounded-full bg-green-500 text-white text-xl flex items-center justify-center">+</button>
      </div>
    `;
  }

  function renderAddButton() {
    bottom.innerHTML = `
      <div class="flex items-center justify-end">
        <button
          class="w-12 h-12 rounded-full bg-green-500 text-white text-2xl flex items-center justify-center"
          data-action="add"
        >+</button>
      </div>
    `;
  }

  /* ---------- делегирование ---------- */
  bottom.addEventListener("click", async (e) => {
    e.stopPropagation();

    const action = e.target.dataset.action;
    if (!action) return;

    try {
      let delta = 0;
      if (action === "add" || action === "increase") delta = +1;
      if (action === "decrease") delta = -1;

      const res = await updateCart(product.id, delta);

      if (res.quantity === 0) {
        renderAddButton();
      } else {
        renderQuantity(res.quantity);
      }
    } catch (e) {
      console.warn(e.message);
    }
  });

  /* ---------- закрытие ---------- */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  function close() {
    sheet.style.transform = "translateY(100%)";
    setTimeout(() => overlay.remove(), 300);
  }
}
