from typing import Optional

from pydantic import BaseModel


class CoachRequest(BaseModel):
    prompt: str


class CoachResponse(BaseModel):
    response: str


class IdeaCreate(BaseModel):
    text: str
    audio_path: Optional[str] = None
