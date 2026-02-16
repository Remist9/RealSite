import "./style.css";
import { showAuthModal } from "./auth/auth_btn.js";
import { renderProfile } from "./profile/profile.js";
import { API_URL } from "./config.js";
import { renderSale } from "./sale/sale.js";
import { renderCatalog } from "./catalog/catalog.js";
import { renderCart } from "./cart/cart.js";
import { renderAdmin } from "./admin/admin.js";

const main_box = document.getElementById("main_box");

let authInProgress = false;

// === 🔐 ПРОВЕРКА АВТОРИЗАЦИИ ===
import { apiFetch } from "./api.js";

async function requireAuth(onSuccess) {
  if (authInProgress) return;
  authInProgress = true;

  try {
    const data = await apiFetch(`${API_URL}/auth/check`);

    if (!data.authenticated) {
      showAuthModal(() => requireAuth(onSuccess));
      return;
    }

    // 🔴 Если админ — показываем админку
    if (data.role === "admin") {
      renderAdmin(main_box);
      return;
    }

    // 🟢 Обычный пользователь
    onSuccess();
  } catch (err) {
    console.error(err);
  } finally {
    authInProgress = false;
  }
}

function isDesktop() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function getCatalogUIConfig() {
  const desktop = isDesktop();

  return {
    search: desktop ? "none" : "local",
    categories: desktop ? "sidebar" : "dropdown",
  };
}

// === РЕНДЕР СТРАНИЦ ===
function renderPage(page) {
  main_box.innerHTML = "";

  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

  switch (page) {
    case "sale":
      if (isDesktop) {
        // на ПК sale = режим каталога
        renderCatalog(main_box, {
          search: "none",
          categories: "sidebar",
        });
      } else {
        renderSale(main_box);
      }
      break;

    case "catalog":
      renderCatalog(main_box, {
        search: isDesktop ? "none" : "local",
        categories: isDesktop ? "sidebar" : "dropdown",
      });
      break;

    case "cart":
      requireAuth(() => renderCart(main_box));
      break;

    case "profile":
      requireAuth(() => renderProfile(main_box));
      break;

    default:
      renderSale(main_box);
  }
}

// === НАВИГАЦИЯ ПО HASH ===
function initPageFromUrl() {
  const page = window.location.hash.replace("#", "") || "sale";
  renderPage(page);
}

// === КНОПКИ НАВИГАЦИИ ===
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.hash = btn.dataset.page;
  });
});

window.addEventListener("hashchange", initPageFromUrl);
initPageFromUrl();
