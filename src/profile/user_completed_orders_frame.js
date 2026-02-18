import { getUserCompletedOrders } from "./profile_api.js";

export function userCompletedOrdersFrame({ container } = {}) {
  const isEmbedded = !!container;

  const root = document.createElement("div");
  root.className = isEmbedded
    ? "w-full h-full"
    : "fixed inset-0 bg-black/40 z-50 flex items-end";

  const sheet = document.createElement("div");
  sheet.className = `
    w-full bg-white
    ${isEmbedded ? "rounded-xl h-full" : "rounded-t-2xl min-h-[70vh] max-h-[90vh]"}
    flex flex-col
    transition-transform duration-300
    translate-y-0
    ${isEmbedded ? "" : "touch-pan-y"}
  `;

  sheet.innerHTML = `
    ${
      isEmbedded
        ? `<h2 class="text-lg font-semibold px-4 py-4 text-center">
             Выполненные заказы
           </h2>`
        : `
          <div class="pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 rounded mx-auto"></div>
          </div>
        `
    }

    <div id="completed-orders-content"
         class="flex-1 overflow-auto px-4 min-h-0">
      Загрузка...
    </div>
  `;

  root.appendChild(sheet);

  if (isEmbedded) {
    container.innerHTML = "";
    container.appendChild(root);
  } else {
    document.body.appendChild(root);
  }

  const content = sheet.querySelector("#completed-orders-content");

  loadOrders();

  async function loadOrders() {
    try {
      const data = await getUserCompletedOrders();

      console.log("Выполненные заказы:", data);

      if (!data?.orders || data.orders.length === 0) {
        content.innerHTML = `
          <div class="text-gray-500">
            У вас пока нет выполненных заказов
          </div>
        `;
        return;
      }

      content.classList.remove("items-center", "justify-center");
      content.classList.add("flex-col", "gap-4", "overflow-auto");

      content.innerHTML = data.orders
        .map((order) => {
          const itemsHtml = order.items
            .map(
              (item, index) => `
                <div>
                  ${index + 1}. ${item.title} × ${item.quantity}
                </div>
              `,
            )
            .join("");

          const completedDate = new Date(order.completed_at).toLocaleString();

          return `
            <div class="w-full border rounded-2xl p-4 text-left shadow-sm bg-white">
              
              <div class="text-lg font-semibold mb-2">
                Заказ №${order.id}
              </div>

              <div class="mb-3">
                <div class="font-medium mb-1">Товары:</div>
                <div class="text-sm text-gray-700 flex flex-col gap-1">
                  ${itemsHtml}
                </div>
              </div>

              <div class="text-sm text-gray-600 flex flex-col gap-1">
                <div><strong>Дата доставки:</strong> ${completedDate}</div>
                <div><strong>Сумма:</strong> ${order.total_cost}</div>
                <div><strong>Вес:</strong> ${order.total_weight}</div>
                <div><strong>Адрес:</strong> ${order.address}</div>
              </div>

            </div>
          `;
        })
        .join("");
    } catch (err) {
      console.error("Ошибка загрузки выполненных заказов:", err);
      content.innerHTML = `
        <div class="text-red-500">
          Ошибка загрузки заказов
        </div>
      `;
    }
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
