from fastapi import APIRouter
from app.schemas import CatalogFilter
from app.catalog.service import extract_items

router = APIRouter()


@router.post("/catalog/filter")
def filter_catalog(filters: CatalogFilter):
    items = extract_items(filters)

    return {
        "ok": True,
        "items": items
    }


