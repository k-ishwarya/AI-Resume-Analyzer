from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Resume, ResumeAnalysis, JobAnalysis
from app.core.deps import get_current_user
from app.schemas.job import JobMatchRequest, JobMatchResponse
from app.services.job_match_service import analyze_job_match

router = APIRouter(prefix="/api/job-match", tags=["Job Match"])

@router.post("/{resume_id}", response_model=JobMatchResponse, status_code=status.HTTP_201_CREATED)
async def match_resume_with_job(
    resume_id: int,
    payload: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
    analysis_data = {}
    if latest_analysis:
        analysis_data = {
            "skills": latest_analysis.skills,
            "experience": latest_analysis.experience,
            "projects": latest_analysis.projects
        }

    match_result = await analyze_job_match(
        resume_text=resume.extracted_text,
        job_title=payload.job_title,
        job_description=payload.job_description,
        resume_analysis=analysis_data
    )

    job_analysis = JobAnalysis(
        resume_id=resume.id,
        job_title=payload.job_title,
        company=payload.company,
        job_description=payload.job_description,
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        keywords=match_result["keywords"],
        experience_match=match_result["experience_match"],
        suggestions=match_result["suggestions"]
    )
    db.add(job_analysis)
    db.commit()
    db.refresh(job_analysis)

    return job_analysis

@router.get("/resume/{resume_id}", response_model=List[JobMatchResponse])
def get_resume_job_matches(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    matches = db.query(JobAnalysis).filter(JobAnalysis.resume_id == resume.id).order_by(JobAnalysis.created_at.desc()).all()
    return matches

@router.get("/{job_analysis_id}", response_model=JobMatchResponse)
def get_job_match(
    job_analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_match = db.query(JobAnalysis).join(Resume).filter(
        JobAnalysis.id == job_analysis_id,
        (Resume.user_id == current_user.id) | (current_user.role == "ADMIN")
    ).first()
    if not job_match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job match analysis not found.")

    return job_match
