import { userAddressAdd } from "./user_address_add.js";
import {
  deleteUserAddress,
  getUserAddress,
  updateUserAddress,
  addUserAddress,
} from "./profile_api.js";

export function userAddressEdit(addresses = [], { container } = {}) {
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
      ? `<h2 class="text-lg font-semibold px-2 py-3">Мои адреса</h2>`
      : `<div class="pt-3 pb-2">
           <div class="w-10 h-1 bg-gray-300 rounded mx-auto"></div>
         </div>`
  }

  <div
    class="flex-1 overflow-auto px-4 pb-6 flex flex-col gap-3"
    id="address-list"
  >
    ${renderAddresses(addresses)}
  </div>
`;

  async function refreshAddresses() {
    const fresh = await getUserAddress();
    addresses = fresh;
    list.innerHTML = renderAddresses(addresses);
  }

  const list = sheet.querySelector("#address-list");
  root.appendChild(sheet);

  if (isEmbedded) {
    container.innerHTML = "";
    container.appendChild(root);
  } else {
    document.body.appendChild(root);
  }

  /* ---------- клики ---------- */
  sheet.addEventListener("click", async (e) => {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;

    const card = actionEl.closest("[data-address-id]");
    const addressId = card?.dataset.addressId;
    const action = actionEl.dataset.action;

    /* ---------- ADD ---------- */
    if (action === "add-address") {
      const changed = await userAddressAdd();
      if (changed) {
        await refreshAddresses();
      }
      return;
    }

    /* ---------- EDIT ---------- */
    if (action === "edit-address") {
      if (!addressId) return;

      const addressObj = addresses.find((a) => a.id == addressId);
      if (!addressObj) return;

      const changed = await userAddressAdd({
        initialValue: addressObj.address,
      });

      if (changed) {
        await refreshAddresses();
      }
      return;
    }

    /* ---------- DELETE ---------- */
    if (action === "delete-address") {
      if (!addressId) return;
      if (!confirm("Удалить этот адрес?")) return;

      try {
        await deleteUserAddress(addressId);
        await refreshAddresses();
      } catch (err) {
        console.error("Ошибка удаления адреса", err);
      }
    }
  });

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

function renderAddresses(addresses) {
  let html = "";

  if (addresses.length > 0) {
    html += addresses
      .map(
        (a) => `
        <div
          class="rounded-2xl border px-4 py-3 text-sm bg-white flex items-center justify-between gap-3"
          data-address-id="${a.id}"
        >
          <div class="flex-1">
            ${a.address}
          </div>

          <div class="flex items-center gap-1">
            <button
              class="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              data-action="edit-address"
              title="Редактировать"
            >
              ✏️
            </button>

            <button
              class="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              data-action="delete-address"
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>
      `,
      )
      .join("");
  }

  // ➕ всегда внизу
  html += `
    <button
      class="
        mt-2
        h-14
        rounded-2xl
        flex items-center justify-center
        text-2xl
        text-gray-500
        hover:bg-gray-100
      "
      data-action="add-address"
    >
      +
    </button>
  `;

  return html;
}
