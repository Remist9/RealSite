import { showLogoutConfirm } from "../auth/logout_modal.js";
import { logoutRequest } from "../auth/auth_actions.js";
import { showAuthModal } from "../auth/auth_btn.js";
import { getMyProfile } from "./profile_api.js";
import { userInfoEdit } from "./user_info_edit.js";

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
  return async function onProfileClick(e) {
    const action = e.target.dataset.action;
    if (!action) return;

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
      renderProfile(main_box); // 🔥 ВОТ ЭТО КЛЮЧ
    });
  });
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
    "flex-[11] bg-red-500 transition-colors duration-300 overflow-hidden";

  // HTML
  main_box.innerHTML = `
    <div class="inner_box flex flex-col overflow-auto h-full">

      <div class="user_info w-full bg-blue-200">
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

      <div class="order_summary w-full bg-blue-300 px-4 py-3">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="stat-card bg-white/70 rounded-lg p-3">
            <div class="text-sm text-gray-600">Сумма</div>
            <div class="text-lg font-semibold">???</div>
          </div>
          <div class="stat-card bg-white/70 rounded-lg p-3">
            <div class="text-sm text-gray-600">Заказы</div>
            <div class="text-lg font-semibold">???</div>
          </div>
          <div class="stat-card bg-white/70 rounded-lg p-3">
            <div class="text-sm text-gray-600">Вес</div>
            <div class="text-lg font-semibold">???</div>
          </div>
        </div>
      </div>

      <div class="option_menu w-full bg-blue-400 px-4 py-3">
        <div class="flex flex-col gap-2 text-sm">
          <div class="option-item cursor-pointer hover:underline">Активные заказы</div>
          <div class="option-item cursor-pointer hover:underline">История заказов</div>
          <div class="option-item cursor-pointer hover:underline">Лист ожидания</div>
          <div class="option-item cursor-pointer hover:underline">Контакты для связи</div>
          <div class="option-item cursor-pointer hover:underline">Мои адреса</div>
        </div>
      </div>

      <div class="logout_menu w-full bg-blue-600 px-4 py-3">
        <div class="flex flex-col gap-2 text-sm">
          <div class="logout_item cursor-pointer hover:underline" data-action="switch-user">
            Сменить пользователя
          </div>
          <div class="logout_item cursor-pointer hover:underline" data-action="logout">
            Выход
          </div>
        </div>
      </div>
    </div>
  `;

  /* =======================
     USER INFO CLICK
  ======================= */
  const userInfo = main_box.querySelector(".user_info");
  userInfo.onclick = (e) => {
    e.stopPropagation();
    userInfoEdit();
  };

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
    document.addEventListener("profile-updated", document._profileUpdatedHandler);
  }

  // загрузка данных
  loadProfile(main_box);
}
