from fastapi import Depends, HTTPException, status, APIRouter
from ..auth.session import get_current_user
from app.db import get_db

router = APIRouter(prefix="/profile", tags=["profile"])

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
                id,
                user_id,
                t_items,
                t_cost,
                t_weight,
                created_at,
                address
            FROM active_orders
            ORDER BY created_at DESC
        """)

        rows = cur.fetchall()

        orders = []

        for row in rows:
            order_id = row[0]
            user_id = row[1]
            raw_items = row[2]

            processed_items = []

            for product_id, quantity in raw_items:
                product = CATALOG_BY_ID.get(product_id)

                if not product:
                    continue

                processed_items.append({
                    "title": product["title"],
                    "quantity": quantity
                })

            orders.append({
                "id": order_id,
                "user_id": user_id,  # 👈 админ должен видеть чей заказ
                "items": processed_items,
                "total_cost": float(row[3]),
                "total_weight": float(row[4]),
                "created_at": row[5],
                "address": row[6],
            })

        return {
            "success": True,
            "orders": orders
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()