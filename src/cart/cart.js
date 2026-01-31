import { fetchCart, updateCart, fetchOrder } from "./cart_api.js";
import { createCartCard } from "./cart_card.js";

export async function renderCart(main_box) {
  main_box.className = `
    flex-[11]
    flex flex-col
    bg-white
    h-full
    overflow-hidden
  `;

  main_box.innerHTML = `
    <!-- Верх: скроллируемая область -->
    <div
      id="cart-content"
      class="
        flex-1
        overflow-y-auto
        p-3
        grid
        grid-cols-1
        md:grid-cols-2
        gap-3
        content-start
      "
    ></div>

    <!-- Empty state -->
    <div
      id="cart-empty"
      class="hidden flex-1 flex items-center justify-center text-gray-400 text-lg"
    >
      Корзина пуста
    </div>

    <!-- Низ: фиксированная панель -->
    <div
      id="cart-footer"
      class="h-20 border-t bg-yellow-600 flex items-center px-4 gap-4"
    >
      <!-- Левая часть -->
      <div class="order_summary flex-1">
        <div class="grid grid-cols-2 gap-3 text-center">
          <div class="stat-card bg-white/80 rounded-lg p-3">
            <div class="text-sm text-gray-600">Сумма</div>
            <div id="cart-total-price" class="text-lg font-semibold">0 ₸</div>
          </div>

          <div class="stat-card bg-white/80 rounded-lg p-3">
            <div class="text-sm text-gray-600">Вес</div>
            <div id="cart-total-weight" class="text-lg font-semibold">0 кг</div>
          </div>
        </div>
      </div>

      <!-- Правая часть -->
      <button
        id="cart-order-btn"
        class="
          h-15 px-8
          bg-green-500 hover:bg-green-600
          text-white text-lg font-semibold
          rounded-xl
          transition-colors
          disabled:opacity-50
        "
      >
        Заказать
      </button>
    </div>
  `;

  const content = main_box.querySelector("#cart-content");
  const footer = main_box.querySelector("#cart-footer");
  const emptyState = main_box.querySelector("#cart-empty");
  const priceEl = main_box.querySelector("#cart-total-price");
  const weightEl = main_box.querySelector("#cart-total-weight");
  const orderBtn = main_box.querySelector("#cart-order-btn");

  function updateSummary(summary = {}) {
    priceEl.textContent = `${summary.total_cost ?? 0} ₸`;
    weightEl.textContent = `${summary.total_weight ?? 0} кг`;
  }

  function updateVisibility(itemsCount) {
    if (itemsCount === 0) {
      footer.classList.add("hidden");
      emptyState.classList.remove("hidden");
    } else {
      footer.classList.remove("hidden");
      emptyState.classList.add("hidden");
    }
  }

  try {
    const cart = await fetchCart();
    const items = cart.items || {};

    updateSummary(cart.summary);
    updateVisibility(Object.keys(items).length);

    const handleChange = async (productId, delta) => {
      try {
        await updateCart(productId, delta);
        const cart = await fetchCart();

        updateSummary(cart.summary);
        updateVisibility(Object.keys(cart.items || {}).length);

        const updatedItem = cart.items?.[productId];
        const existingCard = content.querySelector(
          `[data-product-id="${productId}"]`,
        );

        if (!updatedItem) {
          existingCard?.remove();
          return;
        }

        const newCard = createCartCard(updatedItem, {
          onChange: handleChange,
        });

        existingCard.replaceWith(newCard);
      } catch (e) {
        console.warn("cart update error:", e);
      }
    };

    Object.values(items).forEach((item) => {
      const card = createCartCard(item, {
        onChange: handleChange,
      });
      content.appendChild(card);
    });
  } catch (e) {
    console.warn(e.message);
  }

  orderBtn.onclick = async () => {
    try {
      orderBtn.disabled = true;
      await fetchOrder();

      content.innerHTML = "";
      updateSummary({});
      updateVisibility(0);

      console.log("order created");
    } catch (e) {
      console.warn("order error:", e);
    } finally {
      orderBtn.disabled = false;
    }
  };
}
