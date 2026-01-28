from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from app.db import get_db
from app.auth.session import get_current_user_id
from app.schemas import CartResponse, UpdateCartRequest

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/update", response_model=CartResponse)
def update_cart(data: UpdateCartRequest, request: Request):
    user_id = get_current_user_id(request)

    if not (1 <= data.product_id <= 227):
        raise HTTPException(status_code=400, detail="Некорректный товар")

    if data.delta not in (-1, 1):
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

            cur.execute(
                """
                INSERT INTO active_cart (user_id, product_id, quantity)
                VALUES (%s, %s, 1)
                """,
                (user_id, data.product_id)
            )

            conn.commit()
            return {"product_id": data.product_id, "quantity": 1}

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
    print(rows)

    return {
        "items": {str(pid): qty for pid, qty in rows}
    }

