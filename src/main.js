import "./style.css";
import { showAuthModal } from "./auth/auth_btn.js";
import { renderProfile } from "./profile/profile.js";
import {API_URL} from "./config.js";
import { renderSale } from "./sale/sale.js";
import { renderCatalog } from "./catalog/catalog.js";
import { renderCart } from "./cart/cart.js";

const main_box = document.getElementById("main_box");

// === страницы (пока фоновые) ===
const pages = {
  sale: "bg-white",
  catalog: "bg-green-500",
  cart: "bg-yellow-500",
};

// === универсальная смена страницы ===
function setPage(page) {
  window.location.hash = page;
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



// === ПРОФИЛЬ ===
function openProfilePage() {
  renderProfile(main_box);
}


// === 🔐 ЕДИНАЯ ПРОВЕРКА АВТОРИЗАЦИИ ===
async function requireAuth(onSuccess) {
  const res = await fetch(`${API_URL}/auth/check`, {
    credentials: "include",
  });

  const data = await res.json();

  if (data.authenticated) {
    onSuccess();
  } else {
    showAuthModal(onSuccess);
  }
}

// === НАВИГАЦИЯ ===
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    setPage(page);
  });
});


function initPageFromUrl() {
  const page = window.location.hash.replace("#", "") || "sale";
  setPage(page);
}

window.addEventListener("hashchange", initPageFromUrl);
initPageFromUrl();
