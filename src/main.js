import "./style.css";
import { showAuthModal } from "./auth_btn.js";

const main_box = document.getElementById("main_box");

// === состояние авторизации ===
let isAuth = false;

// === страницы ===
const pages = {
  sale: "bg-red-500",
  catalog: "bg-green-500",
  cart: "bg-yellow-500",
  profile: "bg-white",
};

// === смена страницы ===
function setPage(page) {
  main_box.className =
    "flex-[11] transition-colors duration-300 " + pages[page];
}

// === открытие профиля ===
function openProfilePage() {
  isAuth = true;          // ⬅ если дошли сюда — авторизованы
  setPage("profile");
  console.log("В будущем тут будет profile.js");
}

// === навигация ===
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;

    if (page === "profile" && !isAuth) {
      showAuthModal(openProfilePage);
      return;
    }

    setPage(page);
  });
});

// === ПРОВЕРКА АВТОРИЗАЦИИ ПО КУКАМ ===
fetch("http://localhost:8000/auth/check", {
  credentials: "include", // ⬅ браузер сам отправит куки
})
  .then((res) => res.json())
  .then((data) => {
    isAuth = data.authenticated;
    console.log("Auth status:", isAuth);
  })
  .catch((err) => {
    console.error("Ошибка проверки авторизации", err);
  })
  .finally(() => {
    // ⬅ СТРАНИЦА ГРУЗИТСЯ В ЛЮБОМ СЛУЧАЕ
    setPage("sale");
  });
