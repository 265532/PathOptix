from pydantic import BaseModel
from typing import List, Optional


class HistoryItem(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryItem]] = []
    context: Optional[str] = None
