from pydantic import BaseModel, Field, field_validator
import re

class RegisterRequest(BaseModel):
    login: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6)

    @field_validator("login")
    @classmethod
    def validate_login(cls, v: str):
        if not re.fullmatch(r"[a-zA-Z0-9]+", v):
            raise ValueError("Логин может содержать только латинские буквы и цифры")

        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("Логин должен содержать хотя бы одну букву")

        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str):
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("Пароль должен содержать буквы")

        if not re.search(r"[0-9]", v):
            raise ValueError("Пароль должен содержать цифры")

        return v
    
class LoginRequest(BaseModel):
    login: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6)
    remember_me: bool = False

