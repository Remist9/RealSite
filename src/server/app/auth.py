from fastapi import APIRouter, HTTPException, status, Response, Request
from passlib.context import CryptContext
import psycopg2
import secrets

from app.db import get_db
from app.schemas import RegisterRequest, LoginRequest

from app.auth_utils import is_authenticated

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest):
    password_hash = pwd_context.hash(data.password)

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO realsite_user (login, password_hash)
            VALUES (%s, %s)
            RETURNING id
            """,
            (data.login, password_hash)
        )

        user_id = cur.fetchone()[0]
        conn.commit()

        return {
            "status": "ok",
            "user_id": user_id
        }

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(
            status_code=409,
            detail="Логин уже занят"
        )

    except Exception:
        conn.rollback()
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
            SELECT id, password_hash
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

        user_id, password_hash = user

        # 2. Проверяем пароль
        if not pwd_context.verify(data.password, password_hash):
            raise HTTPException(
                status_code=401,
                detail="Неверный логин или пароль"
            )

        # 3. Генерируем access_token
        access_token = secrets.token_urlsafe(32)

        # 4. Создаём сессию
        cur.execute(
            """
            INSERT INTO user_sessions (user_id, access_token)
            VALUES (%s, %s)
            """,
            (user_id, access_token)
        )

        conn.commit()

        # 5. Если "запомнить меня" — кладём cookie
        if data.remember_me:
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                samesite="lax",
                max_age=60 * 60 * 24 * 30  # 30 дней
            )
        else:
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                samesite="lax",
            )

        return {"status": "ok"}

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
    return {
        "authenticated": is_authenticated(request)
    }



