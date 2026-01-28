export function createProductCard(title, cost) {
  const card = document.createElement("div");

  card.className = `
    aspect-square
    bg-white
    rounded-lg
    shadow
    overflow-hidden
    flex flex-col
  `;

  card.innerHTML = `
    <!-- TITLE -->
    <div class="px-2 py-1">
      <span
        class="text-xs font-medium text-gray-700 truncate block"
        title="${title}"
      >
        ${title}
      </span>
    </div>

    <!-- IMAGE -->
    <div class="flex-1 bg-gray-100 flex items-center justify-center">
      <span class="text-gray-300 text-xs">IMG</span>
    </div>

    <!-- FOOTER -->
    <div class="h-10 px-2 flex items-center">
      <span class="text-sm font-semibold mx-auto">
        ${cost} ₸
      </span>

      <button
        class="
          ml-auto
          w-7 h-7
          rounded-full
          bg-green-500
          text-white
          flex items-center justify-center
          text-lg
          leading-none
          hover:bg-green-600
          active:scale-95
          transition
        "
        title="Добавить в корзину"
      >
        +
      </button>
    </div>
  `;

  return card;
}
