import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data.json"

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

changed = 0

for key, value in data.items():
    if not isinstance(value, dict):
        continue

    for i_key, i_value in value.items():
        if not isinstance(i_value, dict):
            continue

        for z_key, z_value in i_value.items():
            if isinstance(z_value, dict):
                z_value.setdefault("description", "Описание")
                changed += 1

with open(DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Обновлено товаров:", changed)
