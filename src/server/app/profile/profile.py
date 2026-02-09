from fastapi import APIRouter, Request, HTTPException, Depends, status
from app.auth.session import get_current_user_id
from app.db import get_db
from ..schemas import ProfileResponse, ProfileUpdateRequest, AddressCreate, AddressOut
from typing import List

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

@router.post("/address")
def add_address(
    data: AddressCreate,
    request: Request
):
    user_id = get_current_user_id(request)

    address = data.address.strip()
    if not address:
        raise HTTPException(status_code=400, detail="Адрес пустой")

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO user_addresses (user_id, address)
            VALUES (%s, %s)
            RETURNING id, address
            """,
            (user_id, address)
        )

        row = cur.fetchone()
        conn.commit()

        return {
            "id": row[0],
            "address": row[1],
        }

    finally:
        cur.close()
        conn.close()


@router.get("/address", response_model=List[AddressOut])
def get_my_address(
    request: Request,
    db=Depends(get_db),
):
    # 1️⃣ достаём user_id из токена (через куки)
    user_id = get_current_user_id(request)

    cur = db.cursor()
    try:
        # 2️⃣ вытаскиваем все адреса пользователя
        cur.execute(
            """
            SELECT id, address
            FROM user_addresses
            WHERE user_id = %s
            ORDER BY id DESC
            """,
            (user_id,),
        )

        rows = cur.fetchall()

        # 3️⃣ возвращаем список (или пустой список)
        return [
            {"id": row[0], "address": row[1]}
            for row in rows
        ]

    finally:
        cur.close()


@router.delete("/address/{address_id}", status_code=204)
def delete_my_address(
    address_id: int,
    request: Request,
    db=Depends(get_db),
):
    # 1️⃣ user_id из токена
    user_id = get_current_user_id(request)

    cur = db.cursor()
    try:
        # 2️⃣ удаляем ТОЛЬКО если адрес принадлежит пользователю
        cur.execute(
            """
            DELETE FROM user_addresses
            WHERE id = %s AND user_id = %s
            RETURNING id
            """,
            (address_id, user_id),
        )

        deleted = cur.fetchone()

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Адрес не найден",
            )

        db.commit()

        # 204 — тело не нужно
        return

    finally:
        cur.close()


@router.patch("/address/{address_id}", response_model=AddressOut)
def update_my_address(
    address_id: int,
    data: AddressCreate,
    request: Request,
    db=Depends(get_db),
):
    # 1️⃣ user_id из токена
    user_id = get_current_user_id(request)

    cur = db.cursor()
    try:
        # 2️⃣ обновляем ТОЛЬКО свой адрес
        cur.execute(
            """
            UPDATE user_addresses
            SET address = %s
            WHERE id = %s AND user_id = %s
            RETURNING id, address
            """,
            (data.address, address_id, user_id),
        )

        row = cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Адрес не найден",
            )

        db.commit()

        return {
            "id": row[0],
            "address": row[1],
        }

    finally:
        cur.close()
