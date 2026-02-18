export function createUnassignedCard(order) {
  const card = document.createElement("div");

  const formattedDate = new Date(order.created_at).toLocaleString();

  card.className = `
    w-full
    bg-white
    rounded-lg
    shadow-md
    p-6
    flex
    justify-between
    gap-8
  `;

  card.innerHTML = `
    <!-- Левая часть -->
    <div class="flex flex-col gap-2 text-gray-800">

      <div class="text-lg font-semibold">
        Заказ #${order.id}
      </div>

      <div class="text-sm">
        <span class="font-medium">Общая цена:</span>
        ${order.total_cost} ₽
      </div>

      <div class="text-sm">
        <span class="font-medium">Общий вес:</span>
        ${order.total_weight} кг
      </div>

      <div class="text-sm">
        <span class="font-medium">Дата создания:</span>
        ${formattedDate}
      </div>

      <div class="text-sm">
        <span class="font-medium">Адрес:</span>
        ${order.address}
      </div>

    </div>

    <!-- Правая часть -->
    <div class="flex flex-col gap-3 items-end justify-center min-w-40">

      <button
        class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
        data-action="assign-order"
        data-order-id="${order.id}"
      >
        Передать
      </button>

      <button
        class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
        data-action="cancel-order"
        data-order-id="${order.id}"
      >
        Отменить
      </button>

    </div>
  `;

  return card;
}
