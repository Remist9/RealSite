from fastapi import APIRouter, HTTPException, status, Response, Request
from passlib.context import CryptContext
import psycopg2

from app.db import get_db
from app.schemas import RegisterRequest, LoginRequest
from app.auth.session import get_current_user
from app.auth.jwt_utils import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, response: Response):
    password_hash = pwd_context.hash(data.password)

    conn = get_db()
    cur = conn.cursor()

    try:
        # 1️⃣ создаём пользователя
        cur.execute(
            """
            INSERT INTO realsite_user (login, password_hash)
            VALUES (%s, %s)
            RETURNING id
            """,
            (data.login, password_hash)
        )
        user_id = cur.fetchone()[0]

        # 2️⃣ создаём профиль
        cur.execute(
            """
            INSERT INTO user_profile (user_id, first_name, last_name)
            VALUES (%s, %s, %s)
            """,
            (user_id, "", "")
        )

        # 3️⃣ создаём сессию
        role = "user"
        access_token, expires_at = create_access_token(
            {
                "user_id": user_id,
                "role": role
            },
            60 * 24
        )

        cur.execute(
            """
            INSERT INTO user_sessions (user_id, access_token, expires_at)
            VALUES (%s, %s, %s)
            """,
            (user_id, access_token, expires_at)
        )


        conn.commit()

        # 4️⃣ ставим cookie БЕЗ max_age → session-cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
        )

        return {"status": "ok"}

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(
            status_code=409,
            detail="Логин уже занят"
        )

    except Exception as e:
        conn.rollback()
        print("REGISTER ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Ошибка сервера"
        )

    finally:
        cur.close()
        conn.close()

@router.post("/login")
def login(data: LoginRequest, response: Response):
    conn = get_db()
    cur = conn.cursor()

    try:
        # 1. Ищем пользователя
        cur.execute(
            """
            SELECT id, password_hash,role
            FROM realsite_user
            WHERE login = %s
            """,
            (data.login,)
        )

        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Неверный логин или пароль"
            )

        user_id, password_hash,role = user

        # 2. Проверяем пароль
        if not pwd_context.verify(data.password, password_hash):
            raise HTTPException(
                status_code=401,
                detail="Неверный логин или пароль"
            )
        
        if data.remember_me:
            expire_minutes = 60 * 24 * 30
        else:
            expire_minutes = 60 * 24  # 1 день

        # 3. Генерируем access_token
        access_token, expires_at = create_access_token(
            {
                "user_id": user_id,
                "role": role
            },
            expire_minutes
        )


        # 4. Создаём сессию
        cur.execute(
            """
            INSERT INTO user_sessions (user_id, access_token, expires_at)
            VALUES (%s, %s, %s)
            """,
            (user_id, access_token, expires_at)
        )


        conn.commit()

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            max_age=expire_minutes * 60
        )


        return {
                    "status": "ok",
                    "role": role
                }

    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        print("LOGIN ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Ошибка сервера"
        )

    finally:
        cur.close()
        conn.close()


@router.get("/check")
def auth_check(request: Request):
    try:
        user = get_current_user(request)
        return {
            "authenticated": True,
            "role": user["role"]
        }
    except HTTPException:
        return {"authenticated": False}




@router.post("/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get("access_token")

    if not token:
        return {"status": "ok"}

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            DELETE FROM user_sessions
            WHERE access_token = %s
            """,
            (token,)
        )
        conn.commit()

        # удаляем cookie
        response.delete_cookie("access_token")

        return {"status": "ok"}

    finally:
        cur.close()
        conn.close()


