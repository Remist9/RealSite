from fastapi import Request, HTTPException, status
from app.db import get_db

def is_authenticated(request: Request) -> bool:
    token = request.cookies.get("access_token")
    if not token:
        return False

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT 1
            FROM user_sessions
            WHERE access_token = %s
            """,
            (token,)
        )

        return cur.fetchone() is not None

    finally:
        cur.close()
        conn.close()


def get_current_user_id(request: Request) -> int:
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не авторизован"
        )

    conn = get_db() 
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT user_id
            FROM user_sessions
            WHERE access_token = %s
            """,
            (token,)
        )

        row = cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Сессия недействительна"
            )

        return row[0]

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

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT u.id, u.role
            FROM user_sessions s
            JOIN realsite_user u ON u.id = s.user_id
            WHERE s.access_token = %s
            """,
            (token,)
        )

        row = cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Сессия недействительна"
            )

        user_id, role = row

        return {
            "id": user_id,
            "role": role
        }

    finally:
        cur.close()
        conn.close()

