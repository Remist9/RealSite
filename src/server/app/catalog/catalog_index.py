import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[3] / "data.json"

def build_catalog_index(data: dict) -> dict[int, dict]:
    index = {}

    for group, group_data in data.items():
        for category, items in group_data.items():
            for title, item in items.items():
                product_id = item.get("id")
                if product_id is None:
                    continue

                index[product_id] = {
                    "title": title,
                    "group": group,
                    "category": category,
                    **item,
                }

    return index


# 🔥 ВАЖНО: выполняется ОДИН РАЗ
with open(DATA_PATH, "r", encoding="utf-8") as f:
    RAW_CATALOG = json.load(f)

CATALOG_BY_ID = build_catalog_index(RAW_CATALOG)
