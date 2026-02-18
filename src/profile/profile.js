import { showLogoutConfirm } from "../auth/logout_modal.js";
import { logoutRequest } from "../auth/auth_actions.js";
import { showAuthModal } from "../auth/auth_btn.js";
import { getMyProfile, getUserAddress } from "./profile_api.js";
import { userInfoEdit } from "./user_info_edit.js";
import { userAddressEdit } from "./user_address_edit.js";
import { userActiveOrdersFrame } from "./user_active_orders_frame.js";
import { userCompletedOrdersFrame } from "./user_completed_orders_frame";

async function openUserAddressEdit(main_box) {
  try {
    const addresses = await getUserAddress();

    const profileContent = main_box.querySelector(".profile_content");

    const isHidden = !profileContent || profileContent.offsetParent === null;

    if (isHidden) {
      // 📱 мобилка → bottom sheet
      userAddressEdit(addresses);
    } else {
      // 🖥 ПК → embedded
      userAddressEdit(addresses, {
        container: profileContent,
      });
    }
  } catch (err) {
    console.error("Ошибка загрузки адресов:", err);
  }
}

function openUserActiveOrders(main_box) {
  const profileContent = main_box.querySelector(".profile_content");
  const isHidden = !profileContent || profileContent.offsetParent === null;

  if (isHidden) {
    // 📱 мобилка → bottom sheet
    userActiveOrdersFrame();
  } else {
    // 🖥 ПК → embedded
    userActiveOrdersFrame({
      container: profileContent,
    });
  }
}

function openUserCompletedOrders(main_box) {
  const profileContent = main_box.querySelector(".profile_content");
  const isHidden = !profileContent || profileContent.offsetParent === null;

  if (isHidden) {
    // 📱 мобилка → bottom sheet
    userCompletedOrdersFrame();
  } else {
    // 🖥 ПК → embedded
    userCompletedOrdersFrame({
      container: profileContent,
    });
  }
}

/* =======================
   LOAD PROFILE DATA
======================= */
async function loadProfile(main_box) {
  try {
    const profile = await getMyProfile();

    const loginEl = main_box.querySelector("#profile-login");
    const fullNameEl = main_box.querySelector("#profile-fullname");

    if (loginEl) {
      loginEl.textContent = profile.login;
    }

    if (fullNameEl) {
      const firstName = profile.first_name?.trim();
      const lastName = profile.last_name?.trim();

      if (firstName || lastName) {
        fullNameEl.textContent = `${firstName || "Имя"} ${lastName || "Фамилия"}`;
      } else {
        fullNameEl.textContent = "Имя Фамилия";
      }
    }
  } catch (err) {
    console.error("Ошибка загрузки профиля:", err);
    showAuthModal();
  }
}

/* =======================
   STABLE HANDLERS
======================= */

// 🔒 единый handler кликов профиля
function createProfileClickHandler(main_box) {
  return function onProfileClick(e) {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    e.stopPropagation();

    if (action === "logout") {
      showLogoutConfirm(async () => {
        await logoutRequest();
        main_box.innerHTML = "";
        window.location.hash = "sale";
      });
    }

    if (action === "switch-user") {
      showLogoutConfirm(async () => {
        await logoutRequest();
        main_box.innerHTML = "";

        showAuthModal(() => {
          renderProfile(main_box);
        });
      });
    }

    if (action === "edit-user") {
      const profileContent = main_box.querySelector(".profile_content");
      const isHidden = !profileContent || profileContent.offsetParent === null;

      if (isHidden) {
        // 📱 мобилка → bottom sheet
        userInfoEdit({ mode: "mobile" });
      } else {
        // 🖥 ПК → modal
        userInfoEdit({ mode: "desktop" });
      }
    }

    if (action === "addresses") {
      openUserAddressEdit(main_box);
    }

    if (action === "active-orders") {
      openUserActiveOrders(main_box);
    }

    if (action === "completed-orders") {
      openUserCompletedOrders(main_box);
    }
  };
}

// 🔒 обработчик обновления профиля
function onProfileUpdated(main_box) {
  loadProfile(main_box);
}

/* =======================
   RENDER PROFILE
======================= */
export function renderProfile(main_box) {
  // базовые классы
  main_box.className =
    "flex-[11] bg-white transition-colors duration-300 overflow-hidden";

  // HTML
  main_box.innerHTML = `
<div class="inner_box flex flex-col h-full overflow-hidden">

  <!-- ========== TOP ========== -->
  <div class="profile_top flex flex-col lg:flex-row">

    <!-- user_info -->
    <div class="user_info w-full lg:w-80" data-action="edit-user">
      <div class="flex items-center px-4 gap-8 py-4">
        <div class="user_name flex flex-col justify-center">
          <span id="profile-login" class="text-sm text-gray-600">
            Загрузка...
          </span>
          <span id="profile-fullname" class="text-lg font-semibold">
            Имя Фамилия
          </span>
        </div>
      </div>
    </div>

    <!-- order_summary -->
    <div class="order_summary w-full lg:flex-1 px-4 py-3 bg-gray-400">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="stat-card bg-white rounded-lg p-3">
          <div class="text-sm text-gray-600">Сумма</div>
          <div class="text-lg font-semibold">???</div>
        </div>
        <div class="stat-card bg-white rounded-lg p-3">
          <div class="text-sm text-gray-600">Заказы</div>
          <div class="text-lg font-semibold">???</div>
        </div>
        <div class="stat-card bg-white rounded-lg p-3">
          <div class="text-sm text-gray-600">Вес</div>
          <div class="text-lg font-semibold">???</div>
        </div>
      </div>
    </div>

  </div>

  <!-- ========== MIDDLE ========== -->
  <div class="profile_middle flex flex-col lg:flex-row flex-1 min-h-0">

    <!-- option_menu -->
    <div class="option_menu w-full lg:w-80 px-4 py-3 text-sm bg-white">
      <div class="flex flex-col gap-2">
<div 
  class="option-item cursor-pointer hover:underline"
  data-action="active-orders"
>
  Активные заказы
</div>

        <div class="option-item cursor-pointer hover:underline" data-action="completed-orders">
          История заказов
        </div>
        <div class="option-item cursor-pointer hover:underline">
          Лист ожидания
        </div>
        <div class="option-item cursor-pointer hover:underline">
          Контакты для связи
        </div>
        <div
          class="option-item cursor-pointer hover:underline"
          data-action="addresses"
        >
          Мои адреса
        </div>
      </div>
    </div>

    <!-- right content (пока пусто) -->
    <div class="profile_content hidden lg:block flex-1 px-4 py-4 overflow-hidden flex flex-col min-h-0">
      <!-- сюда потом -->
    </div>

  </div>

  <!-- ========== BOTTOM ========== -->
  <div class="logout_menu px-4 py-3 text-lg">
    <div class="flex flex-col gap-2">
      <div
        class="logout_item cursor-pointer hover:underline"
        data-action="switch-user"
      >
        Сменить пользователя
      </div>
      <div
        class="logout_item cursor-pointer hover:underline"
        data-action="logout"
      >
        Выход
      </div>
    </div>
  </div>

</div>

`;

  /* =======================
     ONE-TIME LISTENERS
  ======================= */

  // click handler (1 раз за жизнь main_box)
  if (!main_box._profileClickHandler) {
    main_box._profileClickHandler = createProfileClickHandler(main_box);
    main_box.addEventListener("click", main_box._profileClickHandler);
  }

  // profile-updated (1 раз за документ)
  if (!document._profileUpdatedHandler) {
    document._profileUpdatedHandler = () => onProfileUpdated(main_box);
    document.addEventListener(
      "profile-updated",
      document._profileUpdatedHandler,
    );
  }

  // загрузка данных
  loadProfile(main_box);
}
