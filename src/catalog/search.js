export function createSearchHandler({
  input,
  fetchFn,
  renderFn,
  resetFn,
  minLength = 2,
  delay = 300,
}) {
  let timeout = null;
  let lastQuery = "";
  let requestId = 0;

  input?.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
      // 🔥 Полностью очищено
if (query === "") {
  requestId++;        // 🔥 инвалидируем все старые запросы
  lastQuery = "";

  try {
    await resetFn();
  } catch (err) {
    console.warn("Reset error:", err);
  }

  return;
}

      if (query.length < minLength) return;

      const currentRequest = ++requestId;
      lastQuery = query;

      try {
        const data = await fetchFn(query);

        // 🔐 защита от старых ответов
        if (currentRequest !== requestId) return;
        if (query !== lastQuery) return;

        if (data?.items) renderFn(data.items);
      } catch (err) {
        console.warn("Search error:", err);
      }
    }, delay);
  });
}