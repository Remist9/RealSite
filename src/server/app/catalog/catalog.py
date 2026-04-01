from fastapi import APIRouter, Query
from app.schemas import CatalogFilter
from app.catalog.service import extract_items, search_items

router = APIRouter()


@router.post("/catalog/filter")
def filter_catalog(filters: CatalogFilter):
    items = extract_items(filters.root)

    return {
        "ok": True,
        "items": items
    }


@router.get("/catalog/search")
def search_catalog(q: str = Query(..., min_length=2)):
    items = search_items(q)

    return {
        "ok": True,
        "items": items
    }