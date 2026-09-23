from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class EducationItem(BaseModel):
    degree: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[str] = None
    cgpa_percentage: Optional[str] = None

class SkillsCategorized(BaseModel):
    programming_languages: List[str] = []
    frameworks: List[str] = []
    databases: List[str] = []
    tools: List[str] = []
    cloud: List[str] = []
    ai_ml: List[str] = []
    other: List[str] = []

class ProjectItem(BaseModel):
    name: str
    technologies: List[str] = []
    description: str
    key_contributions: List[str] = []

class ExperienceItem(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    responsibilities: List[str] = []

class WeakSentenceSuggestion(BaseModel):
    current: str
    suggested: str
    reason: str

class ATSBreakdown(BaseModel):
    contact_information: int = 0
    section_structure: int = 0
    skills: int = 0
    keywords: int = 0
    projects: int = 0
    readability: int = 0

class ResumeAnalysisCreate(BaseModel):
    ats_score: int
    ats_breakdown: Dict[str, int]
    personal_info: PersonalInfo
    education: List[EducationItem] = []
    skills: SkillsCategorized
    projects: List[ProjectItem] = []
    experience: List[ExperienceItem] = []
    certifications: List[str] = []
    achievements: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    suggestions: List[WeakSentenceSuggestion] = []
    detected_sections: Dict[str, bool] = {}

class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    ats_score: int
    ats_breakdown: Dict[str, Any]
    personal_info: Dict[str, Any]
    education: List[Dict[str, Any]]
    skills: Dict[str, Any]
    projects: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    certifications: List[str]
    achievements: List[str]
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[Dict[str, Any]]
    detected_sections: Dict[str, Any]
    created_at: datetime
    file_name: Optional[str] = None

    class Config:
        from_attributes = True

class ImproveProjectRequest(BaseModel):
    project_name: str
    technologies: str
    current_description: str

class ImproveProjectResponse(BaseModel):
    improved_description: str
    bullet_points: List[str]
    technical_keywords: List[str]
    suggested_action_verbs: List[str]
