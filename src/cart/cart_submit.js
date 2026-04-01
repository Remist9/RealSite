import { getUserAddress } from "../profile/profile_api";
import { userAddressAdd } from "../profile/user_address_add";
import { fetchOrder } from "./cart_api.js";

export async function openCartSubmit({ mode, summary, onSuccess }) {
  const { totalPrice, totalWeight } = summary ?? {};

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/40 z-50 flex";

  const container = document.createElement("div");

  /* ===================== LAYOUT ===================== */

  if (mode === "sheet") {
    overlay.classList.add("items-end");

    container.className = `
      w-full
      max-h-[90vh]
      bg-white
      rounded-t-2xl
      p-4
      flex
      flex-col
      overflow-y-auto
    `;

    container.innerHTML = `
      <div class="w-10 h-1 bg-gray-300 rounded mx-auto"></div>
      <div class="text-lg font-medium text-center">
        Адрес и Оплата
      </div>
    `;
  } else {
    overlay.classList.add("items-center", "justify-center");

    container.className = `
      w-[400px]
      bg-white
      rounded-2xl
      p-6
      flex
      flex-col
      gap-4
    `;

    container.innerHTML = `
      <div class="text-lg font-medium text-center">
        Адрес и Оплата
      </div>
    `;
  }

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  /* ===================== SUMMARY ===================== */

  if (summary) {
    const summaryBox = renderSummary({ totalPrice, totalWeight });
    container.appendChild(summaryBox);
  }

  /* ===================== ADDRESS SELECT ===================== */

  const addresses = await getUserAddress();
  let selectedAddress = null;

  const selectBox = document.createElement("div");
  selectBox.className = `
    border
    rounded-lg
    p-3
    cursor-pointer
    relative
    flex
    items-center
    justify-between
    gap-2
  `;

  const selectedText = document.createElement("div");
  selectedText.textContent = "Выберите адрес";
  selectedText.className = "text-gray-500 flex-1";

  const addBtn = document.createElement("div");
  addBtn.className = `
    w-6 h-6
    flex items-center justify-center
    rounded-full
    border
    text-lg
    leading-none
    hover:bg-gray-100
  `;
  addBtn.textContent = "+";

  const dropdown = document.createElement("div");
  dropdown.className = `
    absolute
    left-0
    right-0
    top-full
    mt-2
    bg-white
    border
    rounded-lg
    shadow
    max-h-48
    overflow-y-auto
    hidden
    z-50
  `;

  function createAddressItem({ id, address }) {
    const item = document.createElement("div");
    item.className = "p-3 hover:bg-gray-100 cursor-pointer";
    item.textContent = address;

    item.onclick = (e) => {
      e.stopPropagation();
      selectedAddress = { id, address };
      selectedText.textContent = address;
      selectedText.classList.remove("text-gray-500");
      dropdown.classList.add("hidden");

      orderBtn.disabled = false;
      orderBtn.classList.remove("opacity-50", "cursor-not-allowed");
    };

    return item;
  }

  addresses.forEach((addr) => {
    dropdown.appendChild(createAddressItem(addr));
  });

  selectBox.appendChild(selectedText);
  selectBox.appendChild(addBtn);
  selectBox.appendChild(dropdown);
  container.appendChild(selectBox);

  selectBox.onclick = () => {
    dropdown.classList.toggle("hidden");
  };

  /* ===================== ADD ADDRESS ===================== */

  addBtn.onclick = async (e) => {
    e.stopPropagation();

    const changed = await userAddressAdd();
    if (!changed) return;

    const freshAddresses = await getUserAddress();
    dropdown.innerHTML = "";

    freshAddresses.forEach((addr) => {
      dropdown.appendChild(createAddressItem(addr));
    });

    const last = freshAddresses.at(-1);
    if (last) {
      selectedAddress = last;
      selectedText.textContent = last.address;
      selectedText.classList.remove("text-gray-500");

      orderBtn.disabled = false;
      orderBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  };

  /* ===================== ORDER BUTTON ===================== */

  const orderBtn = document.createElement("button");
  orderBtn.className = `
    mt-4
    h-12
    w-full
    bg-green-500
    text-white
    text-lg
    font-semibold
    rounded-xl
    opacity-50
    cursor-not-allowed
  `;
  orderBtn.textContent = "Заказать";
  orderBtn.disabled = true;

  container.appendChild(orderBtn);

  orderBtn.onclick = async () => {
    if (!selectedAddress) return;

    try {
      await fetchOrder(selectedAddress.id);
      overlay.remove();
      onSuccess?.();
    } catch (e) {
      console.warn("order error:", e);
    }
  };

  /* ===================== HELPERS ===================== */

  function renderSummary({ totalPrice, totalWeight }) {
    const box = document.createElement("div");
    box.className = `
      border
      rounded-xl
      p-3
      text-sm
      flex
      flex-col
      gap-1
    `;

    box.innerHTML = `
      <div class="flex justify-between">
        <span class="text-gray-500">Сумма</span>
        <span class="font-medium">${totalPrice} ₽</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Вес</span>
        <span class="font-medium">${totalWeight} кг</span>
      </div>
    `;

    return box;
  }

  return {
    container,
    getSelectedAddress: () => selectedAddress,
  };
}