import { showLogoutConfirm } from "./logout_modal.js";
import { logoutRequest } from "./auth_actions.js";
import { showAuthModal } from "./auth_btn.js";

export function renderProfile(main_box) {
  // сбрасываем классы хоста (по желанию)
  main_box.className =
    "flex-[11] bg-red-500 transition-colors duration-300 overflow-hidden";

  // рендерим страницу профиля
  main_box.innerHTML = `
    <div class="inner_box flex flex-col overflow-auto h-full">

      <!-- USER INFO -->
      <div class="user_info w-full bg-blue-200">
        <div class="flex items-center px-4 gap-8 py-4">

          <!-- Аватар -->
          <div class="avatar w-40 h-48 bg-gray-400 rounded-lg flex-shrink-0"></div>

          <!-- Имя / Фамилия -->
          <div class="user_name flex flex-col justify-center">
            <span class="text-lg font-semibold">Имя Фамилия</span>
            <span class="text-sm text-gray-600">Пользователь</span>
          </div>

        </div>
      </div>

      <!-- ORDER SUMMARY -->
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

      <!-- OPTIONS -->
      <div class="option_menu w-full bg-blue-400 px-4 py-3">
        <div class="flex flex-col gap-2 text-sm">

          <div class="option-item cursor-pointer hover:underline">
            Активные заказы
          </div>

          <div class="option-item cursor-pointer hover:underline">
            История заказов
          </div>

          <div class="option-item cursor-pointer hover:underline">
            Лист ожидания
          </div>

          <div class="option-item cursor-pointer hover:underline">
            Контакты для связи
          </div>

          <div class="option-item cursor-pointer hover:underline">
            Мои адреса
          </div>

        </div>
      </div>
        
      <!-- OPTION -->
       <div class="logout_menu w-full bg-blue-500 px-4 py-3">
        <div class="flex flex-col gap-2 text-sm">
          <div class="logout_item cursor-pointer hover:underline">
            Опции
          </div>
        </div>
      </div>

      <!-- LOGOUT -->
      <div class="logout_menu w-full bg-blue-600 px-4 py-3">
        <div class="flex flex-col gap-2 text-sm">
          <div class="logout_item cursor-pointer hover:underline " data-action="switch-user">
            Сменить пользователя
          </div>
          <div class="logout_item cursor-pointer hover:underline" data-action="logout">
            Выход
          </div>
        </div>
      </div>

    </div>
  `;

main_box.onclick = null;

main_box.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  if (action === "logout") {
    showLogoutConfirm(async () => {
      await logoutRequest();
      main_box.innerHTML = "";
      location.reload();
    });
  }

  if (action === "switch-user") {
    showLogoutConfirm(async () => {
      await logoutRequest();
      main_box.innerHTML = "";
      showAuthModal();
    });
  }
});


}
