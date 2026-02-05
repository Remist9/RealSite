import { fetchCatalogByCategories } from "./catalog_api.js";
import { createProductCard } from "./product_card.js";
import { fetchCartRaw } from "../cart/cart_api.js";

let cartItems = {};

const CATALOG_FILTER_KEY = "catalog_selected_categories";

window.isCatalogDropdownOpen = false;

const CATEGORIES = [
  { id: "all", label: "Акции", group: "stock" },
  { id: "water", label: "Вода", group: "non_alco" },
  { id: "juice", label: "Сок", group: "non_alco" },
  { id: "vodka", label: "Безалкогольная водка", group: "non_alco" },
  { id: "lemonade", label: "Лимонад", group: "non_alco" },
  { id: "tea", label: "Холодный чай", group: "non_alco" },
  { id: "energetik", label: "Энергетик", group: "non_alco" },
  { id: "beer", label: "Пиво", group: "alco" },
  { id: "wine", label: "Вино", group: "alco" },
  { id: "vodka", label: "Водка", group: "alco" },
  { id: "other", label: "Прочее", group: "alco" },
];

/* -------------------- HTML -------------------- */

function renderCategoriesList() {
  return `
    <ul class="flex flex-col text-sm">
      ${CATEGORIES.map(
        (cat) => `
          <li
            class="category-item px-4 py-2 cursor-pointer hover:bg-gray-100"
            data-group="${cat.group}"
            data-category="${cat.id}"
          >
            ${cat.label}
          </li>
        `,
      ).join("")}
    </ul>
  `;
}

function renderLocalSearch() {
  return `
    <div class="relative flex-1">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="text"
        placeholder="Поиск"
        class="w-full h-8 pl-9 pr-3 rounded-md bg-gray-100 text-sm outline-none"
      />
    </div>
  `;
}

/* -------------------- Layout -------------------- */

function renderCatalogLayout(main_box, ui) {
  main_box.innerHTML = `
    <div class="catalog-page flex flex-col h-full min-h-0 relative">

${
  !ui.isSidebarCategories
    ? `
  <div class="catalog-header h-12 sticky top-0 bg-white border-b flex items-center gap-3 px-4 z-20">
    <div class="catalog-menu cursor-pointer text-lg">🗒️</div>
    ${ui.hasLocalSearch ? renderLocalSearch() : ""}
  </div>
`
    : ""
}

      <div class="catalog-body flex flex-1 min-h-0">

        ${
          ui.isSidebarCategories
            ? `
              <aside class="catalog-sidebar w-56 shrink-0 border-r bg-white flex flex-col">
                <div class="flex items-center justify-between px-4 py-2 border-b">
                  <span class="text-sm font-medium">Категории</span>
                  <button class="reset-categories text-gray-400 hover:text-red-600">🔄</button>
                </div>
                <div id="categories-root"></div>
              </aside>
            `
            : ""
        }

        <div class="catalog-content flex-1 min-h-0 overflow-auto relative">

          ${
            !ui.isSidebarCategories
              ? `
                <div class="catalog-categories absolute top-2 left-2 bg-white border rounded-md shadow-md hidden z-30">
                  <div class="flex">
                    <div class="w-48" id="categories-root"></div>
                    <div class="w-8 flex justify-center pt-2">
                      <button class="reset-categories text-gray-400 hover:text-red-600">🔄</button>
                    </div>
                  </div>
                </div>
              `
              : ""
          }

          <div class="catalog-grid p-2 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"></div>
        </div>
      </div>
    </div>
  `;
}

/* -------------------- Main -------------------- */

export function renderCatalog(main_box, config = {}) {
  const { search = "local", categories = "dropdown" } = config;

  const ui = {
    hasLocalSearch: search === "local",
    isSidebarCategories: categories === "sidebar",
  };

  main_box.className = "flex-[11] overflow-hidden";
  renderCatalogLayout(main_box, ui);

  /* ---------- CATEGORIES (ONE SOURCE) ---------- */

  const categoriesRoot = main_box.querySelector("#categories-root");
  categoriesRoot.innerHTML = renderCategoriesList();

  const categoryItems = categoriesRoot.querySelectorAll(".category-item");
  const resetBtn = main_box.querySelector(".reset-categories");
  const menuBtn = main_box.querySelector(".catalog-menu");
  const categoriesBox = main_box.querySelector(".catalog-categories");
  const catalogContent = main_box.querySelector(".catalog-content");

  /* ---------- STATE ---------- */

  const selectedCategories = {};
  let isFilterDirty = false;

  const saved = sessionStorage.getItem(CATALOG_FILTER_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      for (const [g, arr] of Object.entries(parsed)) {
        selectedCategories[g] = new Set(arr);
      }
    } catch {}
  }

  function syncUI() {
    categoryItems.forEach((el) => {
      const g = el.dataset.group;
      const c = el.dataset.category;
      const active = selectedCategories[g]?.has(c);
      el.classList.toggle("bg-green-200", !!active);
    });
  }

  function save() {
    const out = {};
    for (const [g, set] of Object.entries(selectedCategories)) {
      if (set.size) out[g] = [...set];
    }
    sessionStorage.setItem(CATALOG_FILTER_KEY, JSON.stringify(out));
  }

  syncUI();

  /* ---------- EVENTS ---------- */

  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();

    const isHidden = categoriesBox.classList.toggle("hidden");
    window.isCatalogDropdownOpen = !isHidden;
  });

  categoryItems.forEach((el) =>
    el.addEventListener("click", (e) => {
      e.stopPropagation();

      const g = el.dataset.group;
      const c = el.dataset.category;

      if (!selectedCategories[g]) selectedCategories[g] = new Set();

      selectedCategories[g].has(c)
        ? selectedCategories[g].delete(c)
        : selectedCategories[g].add(c);

      save();
      syncUI();

      if (ui.isSidebarCategories) {
        updateCatalog(); // ✅ ПК — применяем сразу
        isFilterDirty = false;
      } else {
        isFilterDirty = true; // 📱 мобилка — ждём outside click
      }
    }),
  );

  resetBtn?.addEventListener("click", (e) => {
    e.stopPropagation();

    for (const set of Object.values(selectedCategories)) set.clear();

    // 👇 НЕ removeItem
    sessionStorage.setItem(CATALOG_FILTER_KEY, JSON.stringify({}));

    isFilterDirty = false;
    syncUI();
    updateCatalog();
  });

  document.addEventListener(
    "click",
    (e) => {
      if (!window.isCatalogDropdownOpen) return;

      // клик по dropdown — разрешаем
      if (categoriesBox?.contains(e.target)) return;
      if (menuBtn?.contains(e.target)) return;

      // ❌ ЛЮБОЙ ДРУГОЙ КЛИК ГАСИМ
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      categoriesBox.classList.add("hidden");
      window.isCatalogDropdownOpen = false;

      if (isFilterDirty) {
        updateCatalog();
        isFilterDirty = false;
      }
    },
    true, // 🔥 CAPTURE PHASE
  );

  /* ---------- DATA ---------- */

  async function updateCatalog() {
    let payload = {};

    const hasAnySelected = Object.values(selectedCategories).some(
      (set) => set.size > 0,
    );

    const saved = sessionStorage.getItem(CATALOG_FILTER_KEY);

    // ✅ ПЕРВЫЙ ЗАПУСК ВКЛАДКИ → АКЦИИ
    if (saved === null) {
      payload = {
        stock: ["all"],
      };
    }

    // ✅ ПОСЛЕ ЛЮБОГО ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ
    else if (hasAnySelected) {
      for (const [g, set] of Object.entries(selectedCategories)) {
        if (set.size) payload[g] = [...set];
      }
    }

    // ✅ иначе payload = {} → все товары

    try {
      try {
        const cart = await fetchCartRaw();
        cartItems = cart.items || {};
      } catch {
        cartItems = {};
      }

      const data = await fetchCatalogByCategories(payload);
      if (data?.items) renderItems(data.items);
    } catch (e) {
      console.warn(e);
    }
  }

  function renderItems(items) {
    const grid = main_box.querySelector(".catalog-grid");
    grid.innerHTML = "";

    for (const [title, p] of Object.entries(items)) {
      const card = createProductCard(
        {
          title,
          cost: p.cost ?? "—",
          description: p.description ?? "",
          image: p.image || null,
          id: p.id,
          factory: p.factory,
          size: p.size,
        },
        { quantity: cartItems[p.id] ?? 0 },
      );
      grid.appendChild(card);
    }
  }

  updateCatalog();
}
