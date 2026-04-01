from fastapi import APIRouter, Request, HTTPException, status, Body
from pydantic import BaseModel
from app.db import get_db
from app.auth.session import get_current_user_id
from app.schemas import CartResponse, UpdateCartRequest,CreateOrderBody
import json
from pathlib import Path
router = APIRouter(prefix="/cart", tags=["cart"])

IMAGE_ROOT = Path(__file__).resolve().parent.parent / "image"

def image_exists(path: str):
    return (IMAGE_ROOT / path).exists()

@router.post("/update", response_model=CartResponse)
def update_cart(data: UpdateCartRequest, request: Request):
    user_id = get_current_user_id(request)

    if not (1 <= data.product_id <= 500):#тут парсим кол-во товаров из БД
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

    print(rows)

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

    try:
        cur.execute("""
            SELECT 
                ac.product_id,
                ac.quantity,
                p.name,
                p.category,
                p.product_group,
                p.cost,
                p.size,
                p.image
            FROM active_cart ac
            JOIN products p ON p.id = ac.product_id
            WHERE ac.user_id = %s
        """, (user_id,))

        rows = cur.fetchall()

        cart_items = {}
        total_cost = 0
        total_weight = 0
        total_size = 0

        for (
            product_id,
            quantity,
            name,
            category,
            product_group,
            cost,
            size,
            image
        ) in rows:

            if image and image_exists(image):
                image_url = f"image/{image}"
            else:
                image_url = None

            line_cost = float(cost) * quantity
            line_weight = float(size) * quantity if size else 0
            line_size = float(size) * quantity if size else 0

            total_cost += line_cost
            total_weight += line_weight
            total_size += line_size

            cart_items[product_id] = {
                "id": product_id,
                "name": name,
                "category": category,
                "product_group": product_group,
                "cost": float(cost),
                "size": float(size) if size else None,
                "image": image_url,
                "quantity": quantity,
                "total_cost": line_cost,
                "total_weight": line_weight,
                "total_size": line_size,
            }

        return {
            "items": cart_items,
            "summary": {
                "total_cost": total_cost,
                "total_weight": total_weight,
                "total_size": total_size,
            }
        }

    finally:
        cur.close()
        conn.close()

@router.post("/order")
def create_order(
    request: Request,
    body: CreateOrderBody = Body(...)
):
    user_id = get_current_user_id(request)

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_db()
    cur = conn.cursor()

    try:
        # 1️⃣ Проверяем адрес
        cur.execute("""
            SELECT address
            FROM user_addresses
            WHERE id = %s AND user_id = %s
        """, (body.address_id, user_id))

        address_row = cur.fetchone()
        if not address_row:
            raise HTTPException(status_code=400, detail="Invalid address")

        address_text = address_row[0]

        # 2️⃣ Получаем корзину с JOIN на products
        cur.execute("""
            SELECT 
                ac.product_id,
                ac.quantity,
                p.name,
                p.cost,
                p.size
            FROM active_cart ac
            JOIN products p ON p.id = ac.product_id
            WHERE ac.user_id = %s
        """, (user_id,))

        rows = cur.fetchall()

        if not rows:
            raise HTTPException(status_code=400, detail="Cart is empty")

        total_cost = 0
        total_weight = 0

        # 3️⃣ Создаём заказ
        cur.execute("""
            INSERT INTO orders (
                user_id,
                total_cost,
                total_weight,
                address
            )
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (user_id, 0, 0, address_text))

        order_id = cur.fetchone()[0]

        # 4️⃣ Добавляем order_items
        for product_id, quantity, name, cost, size in rows:
            line_cost = cost * quantity
            line_weight = size * quantity if size else 0

            total_cost += line_cost
            total_weight += line_weight

            cur.execute("""
                INSERT INTO order_items (
                    order_id,
                    product_id,
                    quantity,
                    name_snapshot,
                    price_snapshot,
                    weight_snapshot
                )
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_id,
                product_id,
                quantity,
                name,
                cost,
                size
            ))

        # 5️⃣ Обновляем итоговую сумму
        cur.execute("""
            UPDATE orders
            SET total_cost = %s,
                total_weight = %s
            WHERE id = %s
        """, (total_cost, total_weight, order_id))

        # 6️⃣ Очищаем корзину
        cur.execute("""
            DELETE FROM active_cart
            WHERE user_id = %s
        """, (user_id,))

        conn.commit()

        return {
            "ok": True,
            "order_id": order_id
        }

    finally:
        cur.close()
        conn.close()