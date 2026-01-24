import json
from pathlib import Path
from app.schemas import CatalogFilter

BASE_DIR = Path(__file__).resolve()
DATA_PATH = BASE_DIR.parents[3] / "data.json"


def extract_items(filters: CatalogFilter) -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    result: dict = {}

    for group, group_data in data.items():
        # достаём соответствующий фильтр
        categories = getattr(filters, group, None)

        # ❌ фильтр не применяли — пропускаем группу
        if categories is None:
            continue

        # ❌ применили, но ничего не выбрали
        if categories == []:
            continue

        # ✅ выбраны категории
        for category in categories:
            if category not in group_data:
                continue

            for item_name, item_data in group_data[category].items():
                result[item_name] = {
                    "group": group,
                    "category": category,
                    **item_data
                }

    return result
