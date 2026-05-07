import json
from pathlib import Path
from app.schemas import CatalogFilter


from app.db import get_db
from app.catalog.utils import normalize

from pathlib import Path

IMAGE_ROOT = Path(__file__).resolve().parent.parent / "image"

def image_exists(path: str):
    return (IMAGE_ROOT / path).exists()


def extract_items(filters: dict):
    conn = get_db()
    cur = conn.cursor()

    base_query = """
        SELECT id, name, category, product_group, cost, size, image
        FROM products
        WHERE is_active = true
    """

    params = []

    if filters:
        group_conditions = []

        for group, categories in filters.items():
            if not categories:
                group_conditions.append("product_group = %s")
                params.append(group)
            else:
                group_conditions.append(
                    "(product_group = %s AND category = ANY(%s))"
                )
                params.append(group)
                params.append(categories)

        base_query += " AND (" + " OR ".join(group_conditions) + ")"

    cur.execute(base_query, params)
    rows = cur.fetchall()

    cur.close()
    conn.close()

    result = {}

    for row in rows:
        image_path = row[6]

        if image_path and image_exists(image_path):
            image_url = f"image/{image_path}"
        else:
            image_url = None  # или "image/default.jpg"

        result[row[0]] = {
            "id": row[0],
            "name": row[1],
            "category": row[2],
            "product_group": row[3],
            "cost": float(row[4]),
            "size": float(row[5]) if row[5] else None,
            "image": image_url
        }

    return result

def search_items(query: str, limit: int = 50):
    query_norm = normalize(query)

    print(query_norm )

    words = [w for w in query_norm.split() if w]

    conn = get_db()
    cur = conn.cursor()

    sql = """
        SELECT id, name, category, product_group, cost, size, image,
            similarity(normalized_blob, %s) AS sim
        FROM products
        WHERE is_active = true
    """

    params = [query_norm]

    for word in words:
        variants = {word}

        if "ja" in word:
            variants.add(word.replace("ja", "ju"))

        sql += " AND (" + " OR ".join(["normalized_blob ILIKE %s"] * len(variants)) + ")"

        for v in variants:
            params.append(f"%{v}%")

    # 🔥 ВАЖНО — после цикла
    sql += """
        ORDER BY sim DESC
        LIMIT %s
    """

    params.append(limit)

    cur.execute(sql, params)
    rows = cur.fetchall()

    cur.close()
    conn.close()

    result = {}

    for row in rows:
        image_path = row[6]

        if image_path and image_exists(image_path):
            image_url = f"image/{image_path}"
        else:
            image_url = None

        result[row[0]] = {
            "id": row[0],
            "name": row[1],
            "category": row[2],
            "product_group": row[3],
            "cost": float(row[4]),
            "size": float(row[5]) if row[5] else None,
            "image": image_url
        }

    return result