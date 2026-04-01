import json
import random
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, "data.json")


def update_costs(obj):
    if isinstance(obj, dict):
        if "cost" in obj:
            obj["cost"] = random.randint(100, 200)
        else:
            for value in obj.values():
                update_costs(value)
    elif isinstance(obj, list):
        for item in obj:
            update_costs(item)


def main():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    update_costs(data)

    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Готово ✅ Все cost обновлены")


if __name__ == "__main__":
    main()
