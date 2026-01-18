function validateLogin(login) {
  if (login.length < 3) {
    return "Логин должен быть не короче 3 символов";
  }

  if (!/^[a-zA-Z0-9]+$/.test(login)) {
    return "Логин может содержать только латинские буквы и цифры";
  }

  if (!/[a-zA-Z]/.test(login)) {
    return "Логин должен содержать хотя бы одну букву";
  }

  return null;
}

function validatePassword(password) {
  if (password.length < 6) {
    return "Пароль должен быть не короче 6 символов";
  }

  if (!/[a-zA-Z]/.test(password)) {
    return "Пароль должен содержать буквы";
  }

  if (!/[0-9]/.test(password)) {
    return "Пароль должен содержать цифры";
  }

  return null;
}


export function showAuthModal(onSuccess) {
  const overlay = document.createElement("div");
  let mode = "choose"; // choose | login | register

  async function registerUser(login, password) {
  const res = await fetch("http://localhost:8000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Ошибка регистрации");
  }

  return data;
}


  overlay.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-50";

  const render = () => {
    overlay.innerHTML = `
      <div class="bg-amber-500/75 w-64 flex flex-col items-center gap-3 rounded-xl p-4 auth-modal">

        ${
          mode === "choose"
            ? `
              <span class="text-white font-medium text-center">
                Требуется авторизация
              </span>

              <div class="w-full flex justify-center gap-2">
                <button class="auth-btn bg-white px-4 py-1 rounded-md text-sm" data-mode="login">
                  Авторизация
                </button>
                <button class="auth-btn bg-white px-4 py-1 rounded-md text-sm" data-mode="register">
                  Регистрация
                </button>
              </div>
            `
            : `
              <div class="w-full flex items-center justify-between text-white font-medium">
                <span>
                  ${mode === "login" ? "Вход" : "Регистрация"}
                </span>

                <button
                  class="auth-back text-white hover:text-gray-200 text-lg leading-none"
                  title="Назад"
                >
                  ✕
                </button>
              </div>


              <input
                  class="auth-login w-full rounded px-2 py-1 text-sm bg-blue-500"
                  placeholder="Логин"
                />
              <input
                  type="password"
                  class="auth-password w-full rounded px-2 py-1 text-sm bg-cyan-300"
                  placeholder="Пароль"
                />

              
              <label>
                <input type="checkbox" class="auth-remember" />
                Запомнить меня
              </label>

              <div class="auth-error text-red-200 text-xs hidden"></div>

              <button class="auth-submit bg-white px-4 py-1 rounded-md text-sm w-full">
                ${mode === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            `
        }

      </div>
    `;
  };

  render();
  document.body.appendChild(overlay);

  // клики внутри модалки
  overlay.addEventListener("click", (e) => {
    const modal = e.target.closest(".auth-modal");
    if (!modal) {
      overlay.remove(); // клик по фону
      return;
    }

    const btn = e.target.closest(".auth-btn");
    if (btn) {
      mode = btn.dataset.mode;
      render();
      return;
    }

    const backBtn = e.target.closest(".auth-back");
    if (backBtn) {
      mode = "choose";
      render();
      return;
    }

    if (e.target.classList.contains("auth-submit")) {
      const loginInput = modal.querySelector(".auth-login");
      const passInput = modal.querySelector(".auth-password");
      const errorBox = modal.querySelector(".auth-error");

      const login = loginInput.value.trim();
      const password = passInput.value.trim();

      errorBox.classList.add("hidden");

      const loginError = validateLogin(login);
      if (loginError) {
        errorBox.textContent = loginError;
        errorBox.classList.remove("hidden");
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        errorBox.textContent = passwordError;
        errorBox.classList.remove("hidden");
        return;
      }


      if (mode === "register") {
        registerUser(login, password)
          .then(() => {
            overlay.remove();
            if (onSuccess) onSuccess();
          })
          .catch((err) => {
            errorBox.textContent = err.message;
            errorBox.classList.remove("hidden");
          });
      }

      if (mode === "login") {
        const rememberCheckbox = modal.querySelector(".auth-remember");
        const rememberMe = rememberCheckbox?.checked ?? false;

        fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            login,
            password,
            remember_me: rememberMe,
          }),
        })
          .then(async (res) => {
            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.detail || "Ошибка авторизации");
            }

            return data;
          })
          .then((data) => {
            // тут успех
            console.log("LOGIN OK:", data);

            overlay.remove();
            if (onSuccess) onSuccess();
          })
          .catch((err) => {
            errorBox.textContent = err.message;
            errorBox.classList.remove("hidden");
          });
      }



      e.stopPropagation();
    }


    e.stopPropagation();
  });
}
