import { showLogoutConfirm } from "../auth/logout_modal.js";
import { logoutRequest } from "../auth/auth_actions.js";

export function renderAdmin(main_box) {
  main_box.className = `
    flex-[11]
    flex
    flex-col
    bg-gray-100
    h-full
  `;

  main_box.innerHTML = `
    <div class="h-15 bg-red-600 text-white flex items-center justify-between px-6">
      <div class="text-xl font-bold">
      </div>

      <button 
        class="admin-logout bg-white text-red-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition"
      >
        Logout
      </button>
    </div>

    <div class="flex-1 flex items-center justify-center text-3xl font-bold text-red-600">
      ADMIN PANEL
    </div>
  `;

  const logoutBtn = main_box.querySelector(".admin-logout");

  logoutBtn.addEventListener("click", async () => {
    showLogoutConfirm(async () => {
      await logoutRequest();
      window.location.hash = "sale";
    });
  });
}
