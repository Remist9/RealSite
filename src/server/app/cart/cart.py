from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from app.db import get_db
from app.auth.session import get_current_user_id
from app.schemas import CartResponse, UpdateCartRequest
from app.catalog.catalog_index import CATALOG_BY_ID

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/update", response_model=CartResponse)
def update_cart(data: UpdateCartRequest, request: Request):
    user_id = get_current_user_id(request)
    print(data)

    if not (1 <= data.product_id <= 227):
        raise HTTPException(status_code=400, detail="Некорректный товар")

    if not isinstance(data.delta, int):
        raise HTTPException(status_code=400, detail="Некорректный delta")


    conn = get_db()
    cur = conn.cursor()

    try:
        # 1️⃣ Проверяем текущую строку
        cur.execute(
            """
            SELECT quantity
            FROM active_cart
            WHERE user_id = %s AND product_id = %s
            """,
            (user_id, data.product_id)
        )

        row = cur.fetchone()

        # 2️⃣ Если товара нет — можно только +
        if row is None:
            if data.delta < 0:
                return {"product_id": data.product_id, "quantity": 0}

            qty = data.delta

            cur.execute(
                """
                INSERT INTO active_cart (user_id, product_id, quantity)
                VALUES (%s, %s, %s)
                """,
                (user_id, data.product_id, qty)
            )

            conn.commit()
            return {"product_id": data.product_id, "quantity": qty}


        # 3️⃣ Товар есть — обновляем quantity
        new_qty = row[0] + data.delta

        if new_qty <= 0:
            cur.execute(
                """
                DELETE FROM active_cart
                WHERE user_id = %s AND product_id = %s
                """,
                (user_id, data.product_id)
            )
            conn.commit()
            return {"product_id": data.product_id, "quantity": 0}

        cur.execute(
            """
            UPDATE active_cart
            SET quantity = %s
            WHERE user_id = %s AND product_id = %s
            """,
            (new_qty, user_id, data.product_id)
        )

        conn.commit()
        return {"product_id": data.product_id, "quantity": new_qty}

    finally:
        cur.close()
        conn.close()

@router.get("/raw")
def get_cart(request: Request):
    user_id = get_current_user_id(request)

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT product_id, quantity
        FROM active_cart
        WHERE user_id = %s
    """, (user_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "items": {str(pid): qty for pid, qty in rows}
    }

@router.get("/cart")
def get_cart(request: Request):
    user_id = get_current_user_id(request)

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT product_id, quantity
        FROM active_cart
        WHERE user_id = %s
    """, (user_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    cart_items: dict[int, dict] = {}

    for product_id, quantity in rows:
        product = CATALOG_BY_ID.get(product_id)

        if not product:
            continue

        cost = product.get("cost", 0)
        weight = product.get("weight", 0)
        size = product.get("size", 0)

        cart_items[product_id] = {
            **product,
            "quantity": quantity,

            # 🧮 расчёты на бэке
            "total_cost": cost * quantity,
            "total_weight": weight * quantity,
            "total_size": size * quantity,
        }

    total_cart_cost = sum(i["total_cost"] for i in cart_items.values())
    total_cart_weight = sum(i["total_weight"] for i in cart_items.values())
    total_cart_size = sum(i["total_size"] for i in cart_items.values())

    return {
        "items": cart_items,
        "summary": {
            "total_cost": total_cart_cost,
            "total_weight": total_cart_weight,
            "total_size": total_cart_size,
        }
    }