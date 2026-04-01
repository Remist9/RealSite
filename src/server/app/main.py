from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.auth import router as auth_router
from app.profile.profile import router as profile_router
from app.catalog.catalog import router as filter_catalog
from app.cart.cart import router as add_to_cart
from app.admin.admin import router as admin_router
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = BASE_DIR / "image"

app.mount("/image", StaticFiles(directory=IMAGE_DIR), name="image")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_origin_regex=r"http://192\.168\.\d+\.\d+:5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(filter_catalog)
app.include_router(add_to_cart)
app.include_router(admin_router)

