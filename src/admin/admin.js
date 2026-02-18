import { showLogoutConfirm } from "../auth/logout_modal.js";
import { logoutRequest } from "../auth/auth_actions.js";
import {
  getAdminActiveOrders,
  delUserActiveOrder,
  patchUserActiveOrder,
} from "./admin_api.js";
import { createUnassignedCard } from "./unassigned_card.js";

let activeOrders = [];
let isAdminListenerAttached = false;

async function adminClickHandler(e) {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  e.stopPropagation();

  if (action === "logout") {
    showLogoutConfirm(async () => {
      await logoutRequest();
      window.location.hash = "sale";
    });
  }

  if (action === "open-unassigned") {
    openUnassignedCard();
  }

  if (action === "cancel-order") {
    const orderId = actionEl.dataset.orderId;

    const confirmed = window.confirm("Отменить заказ?");
    if (!confirmed) return;

    delUserActiveOrder(orderId)
      .then(() => {
        activeOrders = activeOrders.filter(
          (order) => order.id !== Number(orderId),
        );

        openUnassignedCard();
      })
      .catch((err) => {
        console.error("Ошибка удаления заказа:", err);
      });
  }

  if (action === "assign-order") {
    const orderId = actionEl.dataset.orderId;

    const confirmed = window.confirm("Завершить заказ?");
    if (!confirmed) return;

    try {
      await patchUserActiveOrder(orderId);

      activeOrders = activeOrders.filter(
        (order) => order.id !== Number(orderId),
      );

      openUnassignedCard();
    } catch (err) {
      console.error("Ошибка завершения заказа:", err);
    }
  }
}

export async function renderAdmin(main_box) {
  if (!isAdminListenerAttached) {
    main_box.addEventListener("click", adminClickHandler);
    isAdminListenerAttached = true;
  }

  main_box.className = `
    flex-[11]
    flex
    flex-col
    bg-gray-100
    h-full
  `;

  main_box.innerHTML = `
    <div class="h-15 bg-red-600 text-white flex items-center justify-between px-6">
      <div class="flex items-center gap-6">
        <button 
          class="admin-tab text-white font-semibold hover:text-gray-200 transition"
          data-action="open-unassigned"
        >
          Нераспределенные заказы
        </button>
      </div>

      <button 
        class="admin-logout bg-white text-red-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition"
        data-action="logout"
      >
        Logout
      </button>
    </div>

    <div class="admin-content flex-1 flex items-center justify-center text-3xl font-bold text-red-600">
      ADMIN PANEL
    </div>
  `;

  try {
    const response = await getAdminActiveOrders();
    console.log("📦 Active orders:", response);
    activeOrders = response?.orders || [];
  } catch (err) {
    console.error("❌ Ошибка получения заказов:", err);
  }
}

function openUnassignedCard() {
  const content = document.querySelector(".admin-content");

  content.className = `
    admin-content
    flex-1
    p-6
    overflow-y-auto
    flex
    flex-col
    gap-4
  `;

  content.innerHTML = "";

  if (!activeOrders.length) {
    content.innerHTML = `
      <div class="text-xl text-gray-500">
        Нераспределенных заказов нет
      </div>
    `;
    return;
  }

  activeOrders.forEach((order) => {
    const card = createUnassignedCard(order);
    content.appendChild(card);
  });
}
