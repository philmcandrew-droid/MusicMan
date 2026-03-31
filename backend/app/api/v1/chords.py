from fastapi import APIRouter

router = APIRouter()

GUITAR = [
    {"name": "C Major", "notes": ["C", "E", "G"]},
    {"name": "G Major", "notes": ["G", "B", "D"]},
    {"name": "A Minor", "notes": ["A", "C", "E"]},
]

PIANO = [
    {"name": "F Major", "notes": ["F", "A", "C"]},
    {"name": "Cmaj7", "notes": ["C", "E", "G", "B"]},
    {"name": "Dm7", "notes": ["D", "F", "A", "C"]},
]


@router.get("/guitar")
def guitar_chords():
    return GUITAR


@router.get("/piano")
def piano_chords():
    return PIANO
