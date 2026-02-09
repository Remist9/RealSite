import { updateMyProfile } from "./profile_api.js";

export function userInfoEdit() {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/40 z-50 flex items-end";

  const sheet = document.createElement("div");
  sheet.className = `
    w-full bg-white rounded-t-2xl
    min-h-[50vh] max-h-[80vh]
    mx-auto
    lg:max-w-3xl
    p-4
    transition-transform duration-300
    translate-y-0
    touch-pan-y
  `;

  sheet.innerHTML = `
    <div class="w-10 h-1 bg-gray-300 rounded mx-auto mb-3 "></div>

    <h2 class="text-lg font-semibold text-center mb-6">
      Редактирование профиля
    </h2>

    <form class="flex flex-col gap-4" id="profile-edit-form">

      <div>
        <label class="block text-sm text-gray-600 mb-1">Имя</label>
        <input
          type="text"
          name="first_name"
          class="w-full border rounded-lg px-3 py-2"
          placeholder="Имя"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">Фамилия</label>
        <input
          type="text"
          name="last_name"
          class="w-full border rounded-lg px-3 py-2"
          placeholder="Фамилия"
        />
      </div>

      <button
        type="submit"
        class="mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium"
      >
        Сохранить
      </button>

      <div
        id="profile-edit-error"
        class="text-sm text-red-500 text-center hidden"
      ></div>

    </form>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  /* ---------- submit ---------- */
  const form = sheet.querySelector("#profile-edit-form");
  const errorBox = sheet.querySelector("#profile-edit-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const firstName = formData.get("first_name")?.trim();
    const lastName = formData.get("last_name")?.trim();

    // ✅ фронтовая валидация
    if (!firstName && !lastName) {
      errorBox.textContent = "Введите имя или фамилию";
      errorBox.classList.remove("hidden");
      return;
    }

    errorBox.classList.add("hidden");

    try {
      await updateMyProfile({
        first_name: firstName || null,
        last_name: lastName || null,
      });

      document.dispatchEvent(new CustomEvent("profile-updated"));
      close(); // ✅ успех — закрываем окно
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("hidden");
    }
  });

  /* ---------- закрытие ---------- */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

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
