import json
from pathlib import Path
from app.schemas import CatalogFilter

BASE_DIR = Path(__file__).resolve()
DATA_PATH = BASE_DIR.parents[3] / "data.json"


def extract_items(filters: CatalogFilter) -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    result: dict = {}

    # ✅ 1. если НИ ОДИН фильтр не применён — вернуть ВСЁ
    if filters.alco is None and filters.non_alco is None:
        for group, group_data in data.items():
            for category, items in group_data.items():
                for item_name, item_data in items.items():
                    result[item_name] = {
                        "group": group,
                        "category": category,
                        **item_data
                    }
        return result

    # ✅ 2. иначе применяем фильтры по группам
    for group, group_data in data.items():
        categories = getattr(filters, group, None)

        # фильтр не применяли
        if categories is None:
            continue

        # фильтр применили, но ничего не выбрали
        if categories == []:
            continue

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

