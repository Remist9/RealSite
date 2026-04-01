from fastapi import Depends, HTTPException, status, APIRouter
from ..auth.session import get_current_user
from app.db import get_db
from .service import delete_active_order_by_id,complete_active_order

router = APIRouter(prefix="/admin", tags=["admin"])

def require_role(role: str):
    def role_checker(current_user = Depends(get_current_user)):
        if current_user["role"] != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет доступа"
            )
        return current_user
    return role_checker



@router.get("/order/active")
def get_users_active_orders(
    admin = Depends(require_role("admin"))
):
    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT
                o.id,
                o.user_id,
                o.total_cost,
                o.total_weight,
                o.created_at,
                o.address,
                oi.product_id,
                oi.quantity,
                oi.name_snapshot,
                oi.price_snapshot,
                oi.weight_snapshot
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.status = 'pending'
            ORDER BY o.created_at DESC
        """)

        rows = cur.fetchall()

        orders_dict = {}

        for row in rows:
            (
                order_id,
                user_id,
                total_cost,
                total_weight,
                created_at,
                address,
                product_id,
                quantity,
                name_snapshot,
                price_snapshot,
                weight_snapshot
            ) = row

            if order_id not in orders_dict:
                orders_dict[order_id] = {
                    "id": order_id,
                    "user_id": user_id,
                    "items": [],
                    "total_cost": float(total_cost),
                    "total_weight": float(total_weight),
                    "created_at": created_at,
                    "address": address,
                }

            orders_dict[order_id]["items"].append({
                "product_id": product_id,
                "name": name_snapshot,
                "price": float(price_snapshot),
                "quantity": quantity,
                "weight": float(weight_snapshot) if weight_snapshot else 0,
            })

        return {
            "success": True,
            "orders": list(orders_dict.values())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()


@router.delete("/order/active/{order_id}")
def del_user_active_order(
    order_id: int,
    admin = Depends(require_role("admin"))
):
    deleted_id = delete_active_order_by_id(order_id)

    return {
        "success": True,
        "deleted_order_id": deleted_id
    }



@router.patch("/order/active/{order_id}")
def complete_user_order(
    order_id: int,
    admin = Depends(require_role("admin"))
):
    completed_id = complete_active_order(order_id)

    return {
        "success": True,
        "completed_order_id": completed_id
    }
