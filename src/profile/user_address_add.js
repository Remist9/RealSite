export function userAddressAdd({ initialValue = "", onSubmit } = {}) {
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 bg-black/40 z-[100] flex items-center justify-center";

  const modal = document.createElement("div");
  modal.className = `
    bg-white rounded-2xl
    w-[90%] max-w-md
    p-5
    flex flex-col gap-4
  `;

  modal.innerHTML = `
    <h2 class="text-lg font-semibold text-center">Адрес</h2>

    <textarea
      id="address-input"
      class="border rounded-xl p-3 resize-none h-24"
      placeholder="Введите адрес"
    >${initialValue}</textarea>

    <button
      id="save-address"
      class="h-12 rounded-xl bg-green-500 text-white font-semibold"
    >
      Сохранить
    </button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  modal.querySelector("#save-address").onclick = () => {
    const value = modal.querySelector("#address-input").value.trim();
    if (!value) return;

    onSubmit?.(value); // ✅ ВСЕГДА string
    overlay.remove();
  };
}
