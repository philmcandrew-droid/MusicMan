from typing import Optional

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # "user" or "coach"
    text: str


class CoachRequest(BaseModel):
    prompt: str
    history: list[ChatMessage] = []


class CoachResponse(BaseModel):
    response: str
    llm_active: bool = False


class IdeaCreate(BaseModel):
    text: str
    audio_path: Optional[str] = None
