from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobMatchRequest(BaseModel):
    resume_id: Optional[int] = None
    job_title: str = Field(..., min_length=2)
    company: Optional[str] = None
    job_description: str = Field(..., min_length=20)

class JobMatchResponse(BaseModel):
    id: int
    resume_id: int
    job_title: str
    company: Optional[str] = None
    job_description: str
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    keywords: List[str]
    experience_match: str  # "Good", "Partial", "Limited"
    suggestions: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
