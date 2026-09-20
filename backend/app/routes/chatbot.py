from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Resume, ResumeAnalysis, ChatMessage
from app.core.deps import get_current_user
from app.schemas.chatbot import ChatRequest, ChatResponse, ChatMessageResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/chat", tags=["AI Resume Assistant"])

@router.post("", response_model=ChatResponse)
async def send_chat_message(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = None
    resume_id = payload.resume_id
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    else:
        # Pick user's latest resume if not specified
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
        if resume:
            resume_id = resume.id

    resume_text = resume.extracted_text if resume else ""
    analysis_data = {}
    if resume:
        latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
        if latest_analysis:
            analysis_data = {
                "personal_info": latest_analysis.personal_info,
                "education": latest_analysis.education,
                "skills": latest_analysis.skills,
                "projects": latest_analysis.projects,
                "experience": latest_analysis.experience,
                "ats_score": latest_analysis.ats_score,
                "strengths": latest_analysis.strengths,
                "weaknesses": latest_analysis.weaknesses
            }

    # Fetch prior chat history
    history_records = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.resume_id == resume_id
    ).order_by(ChatMessage.created_at.asc()).limit(12).all()

    formatted_history = [{"role": msg.role, "message": msg.message} for msg in history_records]

    # Save user message
    user_msg_record = ChatMessage(
        user_id=current_user.id,
        resume_id=resume_id,
        role="user",
        message=payload.message.strip()
    )
    db.add(user_msg_record)
    db.commit()

    # Generate response
    ai_reply = await gemini_service.chat_with_resume_assistant(
        resume_text=resume_text,
        resume_analysis=analysis_data,
        chat_history=formatted_history,
        user_message=payload.message.strip()
    )

    # Save AI response
    ai_msg_record = ChatMessage(
        user_id=current_user.id,
        resume_id=resume_id,
        role="assistant",
        message=ai_reply
    )
    db.add(ai_msg_record)
    db.commit()

    return {
        "user_message": payload.message.strip(),
        "ai_response": ai_reply,
        "resume_id": resume_id
    }

@router.get("/history/{resume_id}", response_model=List[ChatMessageResponse])
def get_chat_history(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.resume_id == resume_id
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.delete("/history/{resume_id}", status_code=status.HTTP_200_OK)
def clear_chat_history(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.resume_id == resume_id
    ).delete()
    db.commit()
    return {"message": "Chat history cleared successfully."}
