from fastapi import HTTPException
from app.db import get_db
import json


def delete_active_order_by_id(order_id: int) -> int:
    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "DELETE FROM orders WHERE id = %s RETURNING id",
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
        # Проверяем, что заказ существует
        cur.execute(
            """
            SELECT id
            FROM orders
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

        # Меняем статус
        cur.execute(
            """
            UPDATE orders
            SET status = 'completed'
            WHERE id = %s
            RETURNING id
            """,
            (order_id,)
        )

        updated = cur.fetchone()

        conn.commit()

        return updated[0]

    except Exception:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()
