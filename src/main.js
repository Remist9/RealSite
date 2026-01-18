import "./style.css";
import { showAuthModal } from "./auth_btn.js";
import { renderProfile } from "./profile.js";

const main_box = document.getElementById("main_box");

// === страницы (пока фоновые) ===
const pages = {
  sale: "bg-red-500",
  catalog: "bg-green-500",
  cart: "bg-yellow-500",
};

// === универсальная смена страницы ===
function setPage(page) {
  main_box.className =
    "flex-[11] transition-colors duration-300 " + pages[page];
  main_box.innerHTML = "";
}

// === ПРОФИЛЬ ===
function openProfilePage() {
  renderProfile(main_box);
}

// === 🔐 ЕДИНАЯ ПРОВЕРКА АВТОРИЗАЦИИ ===
async function requireAuth(onSuccess) {
  try {
    const res = await fetch("http://localhost:8000/auth/check", {
      credentials: "include",
    });

    const data = await res.json();

    if (data.authenticated) {
      onSuccess(); // ✅ авторизован
    } else {
      showAuthModal(onSuccess); // ❌ нет — логин
    }
  } catch (e) {
    console.error("Auth check failed", e);
    showAuthModal(onSuccess);
  }
}

// === НАВИГАЦИЯ ===
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;

    if (page === "profile") {
      requireAuth(openProfilePage);
      return;
    }

    setPage(page);
  });
});

// === СТАРТ СТРАНИЦЫ ===
setPage("sale");
