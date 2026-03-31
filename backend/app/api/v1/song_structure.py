from fastapi import APIRouter

from app.services.theory_engine import get_song_section_advice

router = APIRouter()


@router.get("/advice/{section}")
def section_advice(section: str):
    return {"section": section, "advice": get_song_section_advice(section)}
