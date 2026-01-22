export function showLogoutConfirm(onConfirm) {
  const overlay = document.createElement("div");

  overlay.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-50";

  overlay.innerHTML = `
    <div class="bg-white rounded-xl p-4 w-64 flex flex-col gap-4">

      <div class="text-sm font-medium text-center">
        Вы уверены, что хотите выйти?
      </div>

      <div class="flex justify-between gap-2">
        <button class="logout-cancel px-3 py-1 rounded bg-gray-200">
          Отмена
        </button>
        <button class="logout-confirm px-3 py-1 rounded bg-red-500 text-white">
          Выйти
        </button>
      </div>

    </div>
  `;

  const close = () => overlay.remove();

  overlay.addEventListener("click", async (e) => {
    // 👇 клик по фону
    if (e.target === overlay) {
      close();
      return;
    }

    // 👇 отмена
    if (e.target.closest(".logout-cancel")) {
      e.stopPropagation(); // 🔥 ВАЖНО
      close();
      return;
    }

    // 👇 подтверждение
    if (e.target.closest(".logout-confirm")) {
      e.stopPropagation(); // 🔥 ВАЖНО
      try {
        await onConfirm();
      } finally {
        close();
      }
    }
  });

  document.body.appendChild(overlay);
}
