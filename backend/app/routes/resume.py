from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Resume, ResumeAnalysis, JobAnalysis
from app.core.deps import get_current_user
from app.services.resume_parser import parse_and_validate_resume
from app.schemas.resume import ResumeResponse, ResumeDetail
from app.core.limiter import limiter

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeDetail, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Validates PDF/DOCX file, extracts text, and stores resume in database.
    """
    file_name, file_type, file_size, extracted_text = await parse_and_validate_resume(file)

    resume = Resume(
        user_id=current_user.id,
        file_name=file_name,
        file_type=file_type,
        file_size=file_size,
        extracted_text=extracted_text
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "file_name": resume.file_name,
        "file_type": resume.file_type,
        "file_size": resume.file_size,
        "extracted_text": resume.extracted_text,
        "created_at": resume.created_at,
        "has_analysis": False,
        "latest_ats_score": None
    }

@router.get("", response_model=List[ResumeResponse])
def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    results = []
    for r in resumes:
        latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == r.id).order_by(ResumeAnalysis.created_at.desc()).first()
        latest_job = db.query(JobAnalysis).filter(JobAnalysis.resume_id == r.id).order_by(JobAnalysis.created_at.desc()).first()
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "file_name": r.file_name,
            "file_type": r.file_type,
            "file_size": r.file_size,
            "created_at": r.created_at,
            "has_analysis": latest_analysis is not None,
            "latest_ats_score": latest_analysis.ats_score if latest_analysis else None,
            "latest_job_match_score": latest_job.match_score if latest_job else None,
            "latest_job_title": latest_job.job_title if latest_job else None,
        })
    return results

@router.get("/{resume_id}", response_model=ResumeDetail)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    
    latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
    latest_job = db.query(JobAnalysis).filter(JobAnalysis.resume_id == resume.id).order_by(JobAnalysis.created_at.desc()).first()
    
    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "file_name": resume.file_name,
        "file_type": resume.file_type,
        "file_size": resume.file_size,
        "extracted_text": resume.extracted_text,
        "created_at": resume.created_at,
        "has_analysis": latest_analysis is not None,
        "latest_ats_score": latest_analysis.ats_score if latest_analysis else None,
        "latest_job_match_score": latest_job.match_score if latest_job else None,
        "latest_job_title": latest_job.job_title if latest_job else None,
    }

@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume and associated analyses deleted successfully."}
