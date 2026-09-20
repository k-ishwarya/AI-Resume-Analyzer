from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    file_name: str
    file_type: str
    file_size: int

class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    created_at: datetime
    has_analysis: bool = False
    latest_ats_score: Optional[int] = None

    class Config:
        from_attributes = True

class ResumeDetail(ResumeResponse):
    extracted_text: str
