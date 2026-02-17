from jose import jwt, JWTError
from datetime import datetime, timedelta

SECRET_KEY = "CHANGE_ME_SUPER_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 день


def create_access_token(data: dict, expire_minutes: int):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expire_minutes)


    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return token, expire



def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
