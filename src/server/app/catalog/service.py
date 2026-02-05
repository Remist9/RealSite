import json
from pathlib import Path
from app.schemas import CatalogFilter

BASE_DIR = Path(__file__).resolve()
DATA_PATH = BASE_DIR.parents[3] / "data.json"


def extract_items(filters: dict) -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    result = {}

    # если фильтры пустые — вернуть всё
    if not filters:
        for group, group_data in data.items():
            for category, items in group_data.items():
                for name, item in items.items():
                    result[name] = {
                        "group": group,
                        "category": category,
                        **item
                    }
        return result

    for group, categories in filters.items():
        if group not in data or not categories:
            continue

        for category in categories:
            if category not in data[group]:
                continue

            for name, item in data[group][category].items():
                result[name] = {
                    "group": group,
                    "category": category,
                    **item
                }

    return result

