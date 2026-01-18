export function renderProfile(main_box) {

    main_box.className =
        "flex-[11] bg-white transition-colors duration-300 p-6";

    main_box.innerHTML = `
        <div class="text-xl font-semibold">
        Привет 👋
        </div>

        <div class="text-sm text-gray-600 mt-2">
        Это твоя страница профиля
        </div>
    `;
}
