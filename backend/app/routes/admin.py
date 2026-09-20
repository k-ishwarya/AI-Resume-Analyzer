from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.database.models import User, Resume, ResumeAnalysis, JobAnalysis
from app.core.deps import get_current_admin
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

@router.get("/statistics")
def get_admin_statistics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_resumes = db.query(func.count(Resume.id)).scalar() or 0
    total_analyses = db.query(func.count(ResumeAnalysis.id)).scalar() or 0
    total_job_matches = db.query(func.count(JobAnalysis.id)).scalar() or 0

    avg_ats = db.query(func.avg(ResumeAnalysis.ats_score)).scalar()
    avg_ats_score = round(float(avg_ats), 1) if avg_ats else 0.0

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_analyses = db.query(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(5).all()

    recent_analyses_data = []
    for ra in recent_analyses:
        resume = db.query(Resume).filter(Resume.id == ra.resume_id).first()
        user = db.query(User).filter(User.id == resume.user_id).first() if resume else None
        recent_analyses_data.append({
            "id": ra.id,
            "resume_id": ra.resume_id,
            "file_name": resume.file_name if resume else "Unknown",
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "ats_score": ra.ats_score,
            "created_at": ra.created_at
        })

    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "total_job_matches": total_job_matches,
        "average_ats_score": avg_ats_score,
        "recent_users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at
            }
            for u in recent_users
        ],
        "recent_analyses": recent_analyses_data
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own active administrator account."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(target_user)
    db.commit()
    return {"message": f"User '{target_user.email}' and all associated records deleted successfully."}

@router.get("/resumes")
def get_all_resumes(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).order_by(Resume.created_at.desc()).all()
    records = []
    for r in resumes:
        user = db.query(User).filter(User.id == r.user_id).first()
        latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == r.id).order_by(ResumeAnalysis.created_at.desc()).first()
        records.append({
            "id": r.id,
            "user_id": r.user_id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "file_name": r.file_name,
            "file_type": r.file_type,
            "file_size": r.file_size,
            "ats_score": latest_analysis.ats_score if latest_analysis else None,
            "created_at": r.created_at
        })
    return records

@router.delete("/resumes/{resume_id}", status_code=status.HTTP_200_OK)
def admin_delete_resume(
    resume_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    db.delete(resume)
    db.commit()
    return {"message": "Resume record deleted by administrator."}
