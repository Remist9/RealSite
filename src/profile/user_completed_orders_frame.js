export function userCompletedOrdersFrame({ container } = {}) {
  const isEmbedded = !!container;

  const root = document.createElement("div");
  root.className = isEmbedded
    ? "w-full h-full"
    : "fixed inset-0 bg-black/40 z-50 flex items-end";

  const sheet = document.createElement("div");
  sheet.className = `
    w-full bg-white
    ${isEmbedded ? "rounded-xl" : "rounded-t-2xl"}
    min-h-[70vh] max-h-[90vh]
    flex flex-col
    transition-transform duration-300
    translate-y-0
    ${isEmbedded ? "" : "touch-pan-y"}
  `;

  sheet.innerHTML = `
    ${
      isEmbedded
        ? `<h2 class="text-lg font-semibold px-2 py-3">
            История
           </h2>`
        : `
          <div class="pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 rounded mx-auto"></div>
          </div>
        `
    }

    <div class="flex-1 flex items-center justify-center text-lg">
      История
    </div>
  `;

  root.appendChild(sheet);

  if (isEmbedded) {
    container.innerHTML = "";
    container.appendChild(root);
  } else {
    document.body.appendChild(root);
  }

  /* ---------- закрытие по фону ---------- */
  if (!isEmbedded) {
    root.addEventListener("click", (e) => {
      if (e.target === root) close();
    });
  }

  /* ---------- swipe down ---------- */
  if (!isEmbedded) {
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

      if (currentY > 100) {
        close();
      } else {
        sheet.style.transform = "translateY(0)";
      }
      currentY = 0;
    });
  }

  function close() {
    if (isEmbedded) return;
    sheet.style.transform = "translateY(100%)";
    setTimeout(() => root.remove(), 300);
  }
}
