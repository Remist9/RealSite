from fastapi import Request, HTTPException, status
from app.db import get_db
from jose import JWTError
from app.auth.jwt_utils import decode_token

def get_current_user_id(request: Request) -> int:
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401)

    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401)

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT 1
            FROM user_sessions
            WHERE access_token = %s
              AND expires_at > NOW()
            """,
            (token,)
        )

        if not cur.fetchone():
            raise HTTPException(status_code=401)

        return payload["user_id"]

    finally:
        cur.close()
        conn.close()



def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не авторизован"
        )

    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен"
        )

    user_id = payload.get("user_id")
    role = payload.get("role")

    # 🔥 дополнительная проверка в БД
    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT 1
            FROM user_sessions
            WHERE access_token = %s
            AND expires_at > NOW()
            """,
            (token,)
        )


        if not cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Сессия отозвана"
            )

        return {
            "id": user_id,
            "role": role
        }

    finally:
        cur.close()
        conn.close()
