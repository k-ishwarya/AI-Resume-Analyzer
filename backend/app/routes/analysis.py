from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Resume, ResumeAnalysis
from app.core.deps import get_current_user
from app.schemas.analysis import ResumeAnalysisResponse, ImproveProjectRequest, ImproveProjectResponse
from app.services.gemini_service import gemini_service
from app.services.ats_service import calculate_ats_metrics

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

@router.post("/improve-project", response_model=ImproveProjectResponse)
async def improve_project(
    payload: ImproveProjectRequest,
    current_user: User = Depends(get_current_user)
):
    return await gemini_service.improve_project_description(
        project_name=payload.project_name,
        technologies=payload.technologies,
        current_description=payload.current_description
    )

@router.post("/{resume_id}", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    # 1. Analyze text using Gemini
    ai_data = await gemini_service.analyze_resume_with_gemini(resume.extracted_text)

    # 2. Compute transparent ATS factors
    ats_results = calculate_ats_metrics(resume.extracted_text, ai_data)

    # 3. Create ResumeAnalysis record
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        ats_score=ats_results["overall_score"],
        ats_breakdown=ats_results["breakdown"],
        personal_info=ai_data.get("personal_info", {}),
        education=ai_data.get("education", []),
        skills=ai_data.get("skills", {}),
        projects=ai_data.get("projects", []),
        experience=ai_data.get("experience", []),
        certifications=ai_data.get("certifications", []),
        achievements=ai_data.get("achievements", []),
        strengths=ats_results["strengths"],
        weaknesses=ats_results["weaknesses"],
        suggestions=ai_data.get("weak_sentences_suggestions", []),
        detected_sections=ats_results["detected_sections"]
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "ats_score": analysis.ats_score,
        "ats_breakdown": analysis.ats_breakdown,
        "personal_info": analysis.personal_info,
        "education": analysis.education,
        "skills": analysis.skills,
        "projects": analysis.projects,
        "experience": analysis.experience,
        "certifications": analysis.certifications,
        "achievements": analysis.achievements,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "suggestions": analysis.suggestions,
        "detected_sections": analysis.detected_sections,
        "created_at": analysis.created_at,
        "file_name": resume.file_name
    }

@router.get("", response_model=List[ResumeAnalysisResponse])
def get_user_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(ResumeAnalysis).join(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(ResumeAnalysis.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "resume_id": a.resume_id,
            "ats_score": a.ats_score,
            "ats_breakdown": a.ats_breakdown,
            "personal_info": a.personal_info,
            "education": a.education,
            "skills": a.skills,
            "projects": a.projects,
            "experience": a.experience,
            "certifications": a.certifications,
            "achievements": a.achievements,
            "strengths": a.strengths,
            "weaknesses": a.weaknesses,
            "suggestions": a.suggestions,
            "detected_sections": a.detected_sections,
            "created_at": a.created_at,
            "file_name": a.resume.file_name if a.resume else "Resume"
        }
        for a in analyses
    ]

@router.get("/{resume_id}", response_model=ResumeAnalysisResponse)
def get_latest_resume_analysis(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Try finding by resume_id first
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    analysis = None
    if resume:
        analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
    
    # If not found by resume_id, check if resume_id was actually analysis_id
    if not analysis:
        analysis = db.query(ResumeAnalysis).join(Resume).filter(
            ResumeAnalysis.id == resume_id,
            (Resume.user_id == current_user.id) | (current_user.role == "ADMIN")
        ).first()
        if analysis:
            resume = analysis.resume

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found for this resume or ID.")

    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "ats_score": analysis.ats_score,
        "ats_breakdown": analysis.ats_breakdown,
        "personal_info": analysis.personal_info,
        "education": analysis.education,
        "skills": analysis.skills,
        "projects": analysis.projects,
        "experience": analysis.experience,
        "certifications": analysis.certifications,
        "achievements": analysis.achievements,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "suggestions": analysis.suggestions,
        "detected_sections": analysis.detected_sections,
        "created_at": analysis.created_at,
        "file_name": resume.file_name
    }

@router.get("/detail/{analysis_id}", response_model=ResumeAnalysisResponse)
def get_analysis_by_id(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(ResumeAnalysis).join(Resume).filter(
        ResumeAnalysis.id == analysis_id,
        (Resume.user_id == current_user.id) | (current_user.role == "ADMIN")
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")

    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "ats_score": analysis.ats_score,
        "ats_breakdown": analysis.ats_breakdown,
        "personal_info": analysis.personal_info,
        "education": analysis.education,
        "skills": analysis.skills,
        "projects": analysis.projects,
        "experience": analysis.experience,
        "certifications": analysis.certifications,
        "achievements": analysis.achievements,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "suggestions": analysis.suggestions,
        "detected_sections": analysis.detected_sections,
        "created_at": analysis.created_at,
        "file_name": analysis.resume.file_name if analysis.resume else "Resume"
    }

@router.delete("/{analysis_id}", status_code=status.HTTP_200_OK)
def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(ResumeAnalysis).join(Resume).filter(
        ResumeAnalysis.id == analysis_id,
        (Resume.user_id == current_user.id) | (current_user.role == "ADMIN")
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")

    db.delete(analysis)
    db.commit()
    return {"message": "Analysis record deleted successfully."}

