from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatRequest(BaseModel):
    resume_id: Optional[int] = None
    message: str = Field(..., min_length=1)

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    user_message: str
    ai_response: str
    resume_id: Optional[int] = None
