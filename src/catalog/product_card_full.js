import { updateCart, fetchCartRaw } from "../cart/cart_api.js";

const QUICK_DELTAS = [5, 10];

export async function showProductCardFull(product) {
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
    overflow-hidden flex flex-col
  `;

  sheet.innerHTML = `
    <div class="w-10 h-1 bg-gray-300 rounded mx-auto my-3"></div>

    <div class="text-center mb-3 px-4">
      <h2 class="text-lg font-semibold">${title}</h2>
    </div>

    <div class="flex-1 overflow-auto px-4 pb-4">
      <div class="flex flex-col sm:flex-row gap-4">

        <div class="sm:w-2/5 aspect-3/4 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
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

          <div class="bg-gray-100 rounded-xl p-4 text-center font-semibold">
            ${cost} ₸
          </div>
        </div>

      </div>
    </div>

    <div class="shrink-0 bg-white px-4 py-3 flex justify-center" data-role="bottom"></div>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  const bottom = sheet.querySelector("[data-role='bottom']");

  /* ---------- UI ---------- */
  function renderAddButton() {
    bottom.innerHTML = `
    <button
      data-delta="1"
      class="w-12 h-12 rounded-full bg-green-500 text-white text-2xl
             flex items-center justify-center transition-all duration-200"
    >+</button>
  `;
  }

  function renderQuantity(quantity) {
    bottom.innerHTML = `
    <div class="flex items-center gap-3 transition-all duration-200">

      <!-- левая группа -->
      <div class="flex items-center gap-2">
        ${QUICK_DELTAS.map(
          (d) => `
            <button
              data-delta="-${d}"
              class="px-3 h-9 rounded-full bg-gray-200 text-sm font-medium"
            >−${d}</button>
          `,
        ).join("")}

        <button
          data-delta="-1"
          class="w-10 h-10 rounded-full bg-gray-200 text-xl
                 flex items-center justify-center"
        >−</button>
      </div>

      <!-- количество -->
      <div class="text-lg font-semibold min-w-[3ch] text-center">
        ${quantity}
      </div>

      <!-- правая группа -->
      <div class="flex items-center gap-2">
        <button
          data-delta="1"
          class="w-10 h-10 rounded-full bg-green-500 text-white text-xl
                 flex items-center justify-center"
        >+</button>

        ${QUICK_DELTAS.map(
          (d) => `
            <button
              data-delta="${d}"
              class="px-3 h-9 rounded-full bg-green-500 text-white text-sm font-medium"
            >+${d}</button>
          `,
        ).join("")}
      </div>

    </div>
  `;
  }

  /* ---------- синхронизация при открытии ---------- */
  try {
    const cart = await fetchCartRaw();
    const quantity = cart.items?.[product.id] ?? 0;

    if (quantity > 0) {
      renderQuantity(quantity);
    } else {
      renderAddButton();
    }
  } catch {
    renderAddButton();
  }

  /* ---------- делегирование ---------- */
  bottom.addEventListener("click", async (e) => {
    e.stopPropagation();

    const btn = e.target.closest("[data-delta]");
    if (!btn) return;

    const delta = Number(btn.dataset.delta);
    if (!delta) return;

    try {
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
