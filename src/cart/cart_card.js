export function createCartCard(item, { onChange } = {}) {
  const card = document.createElement("div");
  card.dataset.productId = item.id;

  card.className = `
    relative w-full h-[120px]
    bg-gray-200 rounded-lg
    flex items-center p-3 gap-3
  `;

  const image = item.image
    ? `<img src="${item.image}" class="w-20 h-20 object-contain rounded-md bg-white" />`
    : `<div class="w-20 h-20 rounded-md bg-white/60 flex items-center justify-center text-xs text-gray-500">
        no image
      </div>`;

  card.innerHTML = `
    <!-- Кнопка удаления -->
    <button
      class="
        cart-remove
        absolute top-2 right-2
        w-7 h-7
        flex items-center justify-center
        rounded-md
        hover:bg-white
        hover:text-red-600
        transition
      "
      title="Удалить из корзины"
    >
      🗑️
    </button>

    ${image}

    <div class="flex-1 h-full flex flex-col">
      <div class="grow-35 flex items-center px-2 pr-8 min-w-0">
        <div class="text-sm font-semibold
            overflow-hidden
            text-ellipsis
            leading-tight
            line-clamp-2">
          ${item.title}
        </div>
      </div>

      <div class="grow-65 flex items-center px-2">
        <div class="flex-[0.6] flex items-center gap-3 text-sm font-semibold">
          <span>${item.total_cost} ₸</span>
          <span class="text-gray-600 font-normal">${item.total_weight} кг</span>
        </div>

        <div class="flex-none flex items-center justify-end gap-2">
          <button class="cart-minus w-7 h-7 rounded-full bg-white border">−</button>
          <div class="min-w-24px text-center font-semibold">
            ${item.quantity}
          </div>
          <button class="cart-plus w-7 h-7 rounded-full bg-white border">+</button>
        </div>
      </div>
    </div>
  `;

  /* ➕ */
  card.querySelector(".cart-plus").onclick = () => onChange?.(item.id, 1);

  /* ➖ */
  card.querySelector(".cart-minus").onclick = () => onChange?.(item.id, -1);

  /* 🗑️ удалить полностью */
  card.querySelector(".cart-remove").onclick = () =>
    onChange?.(item.id, -item.quantity);

  return card;
}
