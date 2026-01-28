export function showProductCardFull(product) {
  const { title, description, cost, image, factory, size } = product;

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/40 z-50 flex items-end";

  const sheet = document.createElement("div");
  sheet.className = `
    w-full bg-white rounded-t-2xl
    min-h-[70vh] max-h-[90vh]
    mx-auto
    lg:max-w-3xl
    transition-transform duration-300
    translate-y-0
    touch-pan-y
    overflow-hidden
    flex flex-col
  `;

  sheet.innerHTML = `
    <!-- DRAG HANDLE -->
    <div class="w-10 h-1 bg-gray-300 rounded mx-auto my-3 shrink-0"></div>

    <!-- TITLE -->
    <div class="text-center mb-3 shrink-0 px-4">
      <h2 class="text-lg font-semibold text-gray-800">
        ${title}
      </h2>
    </div>

    <!-- SCROLLABLE CONTENT -->
    <div class="flex-1 overflow-auto px-4 pb-4">
      <div class="flex flex-col sm:flex-row gap-4">

<div
  class="
    sm:w-2/5 w-full
    aspect-3/4
    bg-gray-100
    rounded-xl
    flex items-center justify-center
    overflow-hidden
  "
>
  ${
    image
      ? `<img src="${image}" alt="${title}" class="w-full h-full object-cover" />`
      : `<span class="text-gray-400 text-sm">Нет изображения</span>`
  }
</div>


        <!-- RIGHT COLUMN -->
        <div class="flex-1 flex flex-col gap-4">

          <!-- DESCRIPTION -->
<div
  class="
    flex-1
    bg-gray-50
    rounded-xl
    p-4
    text-sm text-gray-600
    flex items-center justify-center
    text-center
    min-h-30
  "
>
  ${description || "Описание отсутствует"}
</div>


<div
  class="
    bg-gray-100
    rounded-xl
    p-4
    text-center
    text-base font-semibold text-gray-800
  "
>
  ${cost} ₸
</div>


        </div>
      </div>
    </div>

<!-- BOTTOM ACTION -->
<div class="shrink-0 border-t bg-white px-4 py-3">
  <div class="flex items-center justify-between gap-4">

    <!-- LEFT PLACEHOLDER -->
    <div class="text-sm text-gray-400">
      <!-- тут потом будет другая история -->
    </div>

    <!-- ADD BUTTON -->
    <button
      class="
        w-12 h-12
        rounded-full
        bg-green-500
        text-white
        text-2xl
        flex items-center justify-center
        hover:bg-green-600
        active:scale-95
        transition
        shadow-lg
      "
      title="Добавить в корзину"
    >
      +
    </button>

  </div>
</div>

  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  /* ---------- закрытие по клику на фон ---------- */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  /* ---------- свайп вниз ---------- */
  let startY = 0;
  let currentY = 0;
  let dragging = false;

  sheet.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    dragging = true;
    sheet.style.transition = "none";
  });

  sheet.addEventListener("touchmove", (e) => {
    if (!dragging) return;

    currentY = e.touches[0].clientY - startY;
    if (currentY > 0) {
      sheet.style.transform = `translateY(${currentY}px)`;
    }
  });

  sheet.addEventListener("touchend", () => {
    dragging = false;
    sheet.style.transition = "transform 0.3s";

    if (currentY > 80) {
      close();
    } else {
      sheet.style.transform = "translateY(0)";
    }

    currentY = 0;
  });

  function close() {
    sheet.style.transform = "translateY(100%)";
    setTimeout(() => overlay.remove(), 300);
  }
}
