import { fetchCatalogByCategories } from "./catalog_api.js";
import { createProductCard } from "./product_card.js";
import { fetchCartRaw } from "../cart/cart_api.js";

let cartItems = {};

const CATALOG_FILTER_KEY = "catalog_selected_categories";

window.isCatalogCategoriesOpen = false;

const CATEGORIES = [
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

export function renderCatalog(main_box) {
  main_box.className =
    "flex-[11] bg-green-500 transition-colors duration-300 overflow-hidden";

  main_box.innerHTML = `
    <div class="catalog-page flex flex-col h-full min-h-0 relative">

      <!-- HEADER -->
      <div
        class="
          catalog-header
          h-12 shrink-0
          sticky top-0
          bg-white
          border-b
          flex items-center gap-3
          px-4
          z-20
        "
      >
        <!-- MENU BUTTON -->
        <div
          class="catalog-menu cursor-pointer text-lg select-none"
          title="Категории"
        >
          🗒️
        </div>

        <!-- SEARCH -->
        <div class="relative flex-1">
          <span
            class="
              absolute left-3 top-1/2 -translate-y-1/2
              text-gray-400 pointer-events-none
            "
          >
            🔍
          </span>

          <input
            type="text"
            placeholder="Поиск"
            class="
              w-full h-8
              pl-9 pr-3
              rounded-md
              bg-gray-100
              text-sm
              outline-none
              focus:bg-white
              focus:ring-1 focus:ring-gray-300
            "
          />
        </div>
      </div>

      <!-- CATEGORY DROPDOWN -->
      <div
        class="
          catalog-categories
          absolute top-12 left-0
          bg-white
          border
          rounded-md
          shadow-md
          hidden
          z-30
        "
      >
        <div class="flex">
          <div class="w-48">
            <ul class="flex flex-col text-sm">
              ${CATEGORIES.map(
                (cat) => `
                  <li
                    class="category-item px-4 py-2 cursor-pointer hover:bg-gray-100"
                    data-category="${cat.id}"
                    data-group="${cat.group}"
                  >
                    ${cat.label}
                  </li>
                `,
              ).join("")}
            </ul>
          </div>

          <div class="w-8 flex flex-col items-center justify-start pt-2">
            <button
              class="
                reset-categories
                text-xl
                leading-none
                text-gray-400
                hover:text-red-600
                transition-colors
              "
              title="Сбросить категории"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      <!-- CONTENT -->
<div class="catalog-content flex-1 min-h-0 overflow-auto">
  <div
    class="
      catalog-grid
      p-2
      grid
      gap-2
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
    "
  >


  </div>
</div>


    </div>
  `;

  const menuBtn = main_box.querySelector(".catalog-menu");
  const categoriesBox = main_box.querySelector(".catalog-categories");
  const categoryItems = main_box.querySelectorAll(".category-item");
  const resetBtn = main_box.querySelector(".reset-categories");

  const selectedCategories = {
    alco: new Set(),
    non_alco: new Set(),
  };

  const savedCategories = localStorage.getItem(CATALOG_FILTER_KEY);

  function syncCategoryUI() {
    categoryItems.forEach((item) => {
      const group = item.dataset.group;
      const category = item.dataset.category;

      if (selectedCategories[group].has(category)) {
        item.classList.add("bg-green-200", "text-green-900");
      } else {
        item.classList.remove("bg-green-200", "text-green-900");
      }
    });
  }

  if (savedCategories) {
    try {
      const parsed = JSON.parse(savedCategories);

      parsed.alco?.forEach((c) => selectedCategories.alco.add(c));
      parsed.non_alco?.forEach((c) => selectedCategories.non_alco.add(c));
    } catch {
      localStorage.removeItem(CATALOG_FILTER_KEY);
    }
  }

  syncCategoryUI();

  function saveCategories() {
    const payload = {
      alco: [...selectedCategories.alco],
      non_alco: [...selectedCategories.non_alco],
    };

    localStorage.setItem(CATALOG_FILTER_KEY, JSON.stringify(payload));
  }

  // открыть / закрыть список
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    const willOpen = categoriesBox.classList.contains("hidden");

    categoriesBox.classList.toggle("hidden");
    window.isCatalogCategoriesOpen = willOpen;
  });

  // выбор категории
  categoryItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();

      const group = item.dataset.group;
      const category = item.dataset.category;

      if (selectedCategories[group].has(category)) {
        selectedCategories[group].delete(category);
      } else {
        selectedCategories[group].add(category);
      }

      saveCategories();
      syncCategoryUI();
    });
  });

  // клик вне — закрыть
  document.addEventListener("click", () => {
    if (categoriesBox.classList.contains("hidden")) return;

    categoriesBox.classList.add("hidden");
    window.isCatalogCategoriesOpen = false;
    updateCatalog();
  });

  categoriesBox.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  resetBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    selectedCategories.alco.clear();
    selectedCategories.non_alco.clear();

    localStorage.removeItem(CATALOG_FILTER_KEY);

    selectedCategories.alco.clear();
    selectedCategories.non_alco.clear();

    localStorage.removeItem(CATALOG_FILTER_KEY);

    syncCategoryUI();
    updateCatalog(); // отправит {}
  });

  async function updateCatalog() {
    const payload = {};

    if (selectedCategories.alco.size) {
      payload.alco = [...selectedCategories.alco];
    }

    if (selectedCategories.non_alco.size) {
      payload.non_alco = [...selectedCategories.non_alco];
    }

    try {
      // 1️⃣ пробуем получить корзину
      try {
        const cart = await fetchCartRaw();
        cartItems = cart.items || {};
      } catch {
        // не авторизован — корзина пустая
        cartItems = {};
      }

      // 2️⃣ получаем каталог
      const data = await fetchCatalogByCategories(payload);
      if (!data?.ok || !data.items) return;

      // 3️⃣ рендер
      renderCatalogItems(data.items);
    } catch (e) {
      console.warn(e);
    }
  }

  function renderCatalogItems(items) {
    const grid = document.querySelector(".catalog-grid");
    if (!grid) return;

    grid.innerHTML = "";

    Object.entries(items).forEach(([title, product]) => {
      const cost = product.cost ?? "—";
      const productData = {
        title,
        cost: product.cost ?? "—",
        description: product.description ?? "",
        image: product.image || null,
        id: product.id,
        factory: product.factory,
        size: product.size,
      };

      const quantity = cartItems[product.id] ?? 0;

      const card = createProductCard(productData, {
        quantity,
      });

      grid.appendChild(card);
    });
  }

  updateCatalog();
}
