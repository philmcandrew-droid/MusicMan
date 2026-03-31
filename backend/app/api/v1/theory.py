from fastapi import APIRouter

from app.services.theory_engine import circle_of_fifths_neighbors

router = APIRouter()


@router.get("/circle-of-fifths/{key}")
def get_neighbors(key: str):
    return circle_of_fifths_neighbors(key)
