from fastapi import HTTPException
from app.db import get_db
import json


def delete_active_order_by_id(order_id: int) -> int:
    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "DELETE FROM active_orders WHERE id = %s RETURNING id",
            (order_id,)
        )

        deleted = cur.fetchone()

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Заказ не найден"
            )

        conn.commit()
        return deleted[0]

    except Exception as e:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()

def complete_active_order(order_id: int) -> int:
    conn = get_db()
    cur = conn.cursor()

    try:
        # 1️⃣ Получаем заказ
        cur.execute(
            """
            SELECT user_id, t_items, t_cost, t_weight, address
            FROM active_orders
            WHERE id = %s
            """,
            (order_id,)
        )

        order = cur.fetchone()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Заказ не найден"
            )

        user_id, t_items, t_cost, t_weight, address = order

        # 2️⃣ Вставляем в completed_orders
        cur.execute(
            """
            INSERT INTO completed_orders
            (user_id, t_items, t_cost, t_weight, address)
            VALUES (%s, %s::jsonb, %s, %s, %s)
            RETURNING id
            """,
            (user_id, json.dumps(t_items), t_cost, t_weight, address)
        )

        completed_id = cur.fetchone()[0]

        # 3️⃣ Удаляем из active_orders
        cur.execute(
            "DELETE FROM active_orders WHERE id = %s",
            (order_id,)
        )

        conn.commit()

        return completed_id

    except Exception:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()
