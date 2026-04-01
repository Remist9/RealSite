from pydantic import BaseModel, Field, field_validator,RootModel
import re
from typing import Optional, List, Dict

class RegisterRequest(BaseModel):
    login: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6)

    @field_validator("login")
    @classmethod
    def validate_login(cls, v: str):
        if not re.fullmatch(r"[a-zA-Z0-9@_]+", v):
            raise ValueError(
                "Логин может содержать только латинские буквы, цифры и символ @"
            )

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

class ProfileResponse(BaseModel):
    login: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class CatalogFilter(RootModel[Dict[str, List[str]]]):
    pass

class UpdateCartRequest(BaseModel):
    product_id: int
    delta: int  # +1 или -1

class CartResponse(BaseModel):
    product_id: int
    quantity: int

class AddressCreate(BaseModel):
    address: str  

class AddressOut(BaseModel):
    id: int
    address: str  

class CreateOrderBody(BaseModel):
    address_id: int
    