from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.db import get_session
from app.models import Idea
from app.schemas import IdeaCreate

router = APIRouter()


@router.get("/")
def list_ideas(session: Session = Depends(get_session)):
    return session.exec(select(Idea)).all()


@router.post("/")
def create_idea(payload: IdeaCreate, session: Session = Depends(get_session)):
    idea = Idea(text=payload.text, audio_path=payload.audio_path)
    session.add(idea)
    session.commit()
    session.refresh(idea)
    return idea
