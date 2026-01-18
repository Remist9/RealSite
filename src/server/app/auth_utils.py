from fastapi import Request
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
