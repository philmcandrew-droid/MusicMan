from fastapi import APIRouter

from app.api.v1 import ai, chords, ideas, song_structure, theory

api_router = APIRouter()
api_router.include_router(chords.router, prefix="/chords", tags=["chords"])
api_router.include_router(song_structure.router, prefix="/song-structure", tags=["song-structure"])
api_router.include_router(ideas.router, prefix="/ideas", tags=["ideas"])
api_router.include_router(theory.router, prefix="/theory", tags=["theory"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
