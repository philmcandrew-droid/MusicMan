from typing import Optional

from sqlmodel import Field, SQLModel


class Idea(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    audio_path: Optional[str] = None
