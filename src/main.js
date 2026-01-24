import "./style.css";
import { showAuthModal } from "./auth/auth_btn.js";
import { renderProfile } from "./profile/profile.js";
import { API_URL } from "./config.js";
import { renderSale } from "./sale/sale.js";
import { renderCatalog } from "./catalog/catalog.js";
import { renderCart } from "./cart/cart.js";

const main_box = document.getElementById("main_box");

let authInProgress = false;

// === 🔐 ПРОВЕРКА АВТОРИЗАЦИИ ===
async function requireAuth(onSuccess) {
  if (authInProgress) return;
  authInProgress = true;

  const res = await fetch(`${API_URL}/auth/check`, {
    credentials: "include",
  });

  const data = await res.json();

  if (data.authenticated) {
    authInProgress = false;
    onSuccess();
  } else {
    showAuthModal(() => {
      authInProgress = false;
      onSuccess();
    });
  }
}

// === РЕНДЕР СТРАНИЦ ===
function renderPage(page) {
  main_box.innerHTML = "";

  switch (page) {
    case "sale":
      renderSale(main_box);
      break;

    case "catalog":
      renderCatalog(main_box);
      break;

    case "cart":
      renderCart(main_box);
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
