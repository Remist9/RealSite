import { updateCart, fetchCartRaw } from "../cart/cart_api.js";

const QUICK_DELTAS = [5, 10];

export async function showProductCardFull(product) {
  const { name, description, cost, image } = product;

  /* ---------- overlay ---------- */
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 bg-black/40 z-50 flex items-end";

  /* ---------- sheet ---------- */
  const sheet = document.createElement("div");
  sheet.className = `
    w-full bg-white rounded-t-2xl
    min-h-[70dvh] max-h-[90dvh]
    mx-auto lg:max-w-3xl
    transition-transform duration-300
    translate-y-full
    overflow-hidden flex flex-col
    touch-pan-y
  `;

  sheet.innerHTML = `
    <div class="w-10 h-1 bg-gray-300 rounded mx-auto my-3"></div>

    <div class="text-center mb-3 px-4">
      <h2 class="text-lg font-semibold">${name}</h2>
    </div>

    <div class="flex-1 overflow-auto px-4 pb-4" data-scroll>
      <div class="flex flex-col sm:flex-row gap-4">

        <div class="sm:w-2/5 aspect-3/4 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
          ${
            image
              ? `<img src="http://${location.hostname}:8000/${image}" 
                class="w-full h-full object-cover" />`
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

  /* ---------- open animation ---------- */
  requestAnimationFrame(() => {
    sheet.classList.remove("translate-y-full");
    sheet.classList.add("translate-y-0");
  });

  /* ---------- prevent body scroll ---------- */
  document.body.style.overflow = "hidden";

  /* ---------- swipe logic ---------- */
  const scrollArea = sheet.querySelector("[data-scroll]");

  let startY = 0;
  let currentY = 0;
  let dragging = false;

  sheet.addEventListener("touchstart", (e) => {
    if (scrollArea.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      dragging = true;
      sheet.style.transition = "none";
    }
  });

  sheet.addEventListener("touchmove", (e) => {
    if (!dragging) return;

    currentY = e.touches[0].clientY;
    const delta = currentY - startY;

    if (delta > 0) {
      sheet.style.transform = `translateY(${delta}px)`;
    }
  });

  sheet.addEventListener("touchend", () => {
    if (!dragging) return;

    dragging = false;
    const delta = currentY - startY;

    sheet.style.transition = "transform 0.3s";

    if (delta > 120) {
      close();
    } else {
      sheet.style.transform = "translateY(0)";
    }
  });

  /* ---------- UI ---------- */
  const bottom = sheet.querySelector("[data-role='bottom']");

  function renderAddButton() {
    bottom.innerHTML = `
      <button
        data-delta="1"
        class="w-12 h-12 rounded-full bg-green-500 text-white text-2xl
               flex items-center justify-center"
      >+</button>
    `;
  }

  function renderQuantity(quantity) {
    bottom.innerHTML = `
      <div class="flex items-center gap-3">

        <div class="flex items-center gap-2">
          ${QUICK_DELTAS.map(
            (d) => `
              <button data-delta="-${d}"
                class="px-3 h-9 rounded-full bg-gray-200 text-sm font-medium">
                −${d}
              </button>
            `,
          ).join("")}

          <button data-delta="-1"
            class="w-10 h-10 rounded-full bg-gray-200 text-xl flex items-center justify-center">
            −
          </button>
        </div>

        <div class="text-lg font-semibold min-w-[3ch] text-center">
          ${quantity}
        </div>

        <div class="flex items-center gap-2">
          <button data-delta="1"
            class="w-10 h-10 rounded-full bg-green-500 text-white text-xl flex items-center justify-center">
            +
          </button>

          ${QUICK_DELTAS.map(
            (d) => `
              <button data-delta="${d}"
                class="px-3 h-9 rounded-full bg-green-500 text-white text-sm font-medium">
                +${d}
              </button>
            `,
          ).join("")}
        </div>

      </div>
    `;
  }

  try {
    const cart = await fetchCartRaw();
    const quantity = cart.items?.[product.id] ?? 0;

    quantity > 0 ? renderQuantity(quantity) : renderAddButton();
  } catch {
    renderAddButton();
  }

  bottom.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-delta]");
    if (!btn) return;

    const delta = Number(btn.dataset.delta);
    if (!delta) return;

    try {
      const res = await updateCart(product.id, delta);
      res.quantity === 0
        ? renderAddButton()
        : renderQuantity(res.quantity);
    } catch (e) {
      console.warn(e.message);
    }
  });

  /* ---------- close ---------- */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  function close() {
    sheet.classList.remove("translate-y-0");
    sheet.classList.add("translate-y-full");

    setTimeout(() => {
      document.body.style.overflow = "";
      overlay.remove();
    }, 300);
  }
}