from fastapi import APIRouter, Request, HTTPException
from app.auth.session import get_current_user_id
from app.db import get_db
from ..schemas import ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(request: Request):
    user_id = get_current_user_id(request)

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                u.login,
                p.first_name,
                p.last_name
            FROM realsite_user u
            LEFT JOIN user_profile p ON p.user_id = u.id
            WHERE u.id = %s
            """,
            (user_id,)
        )

        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        return {
            "login": row[0],
            "first_name": row[1],
            "last_name": row[2],
        }

    finally:
        cur.close()
        conn.close()


@router.patch("/me")
def update_my_profile(
    data: ProfileUpdateRequest,
    request: Request
):
    user_id = get_current_user_id(request)

    if data.first_name is None and data.last_name is None:
        raise HTTPException(
            status_code=400,
            detail="Нет данных для обновления"
        )

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO user_profile (user_id, first_name, last_name)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE
            SET
                first_name = COALESCE(EXCLUDED.first_name, user_profile.first_name),
                last_name  = COALESCE(EXCLUDED.last_name, user_profile.last_name)
            """,
            (user_id, data.first_name, data.last_name)
        )

        conn.commit()

        return {"status": "ok"}

    finally:
        cur.close()
        conn.close()