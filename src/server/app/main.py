from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.auth import router as auth_router
from app.profile.profile import router as profile_router
from app.catalog.catalog import router as filter_catalog

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # потом заменим на домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(filter_catalog)
