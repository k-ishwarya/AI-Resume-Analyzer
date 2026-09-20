from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="USER", nullable=False)  # "USER" or "ADMIN"
    created_at = Column(DateTime(timezone=True), default=utc_now)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # "pdf" or "docx"
    file_size = Column(Integer, nullable=False)  # in bytes
    extracted_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")
    job_analyses = relationship("JobAnalysis", back_populates="resume", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="resume", cascade="all, delete-orphan")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    ats_score = Column(Integer, default=0, nullable=False)
    ats_breakdown = Column(JSON, default=dict)
    personal_info = Column(JSON, default=dict)
    education = Column(JSON, default=list)
    skills = Column(JSON, default=dict)
    projects = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    detected_sections = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    resume = relationship("Resume", back_populates="analyses")

class JobAnalysis(Base):
    __tablename__ = "job_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    job_description = Column(Text, nullable=False)
    match_score = Column(Integer, default=0, nullable=False)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    experience_match = Column(String(50), default="Partial")  # "Good", "Partial", "Limited"
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    resume = relationship("Resume", back_populates="job_analyses")

class ChatMessage(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True)
    role = Column(String(50), nullable=False)  # "user" or "assistant"
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="chat_messages")
    resume = relationship("Resume", back_populates="chat_messages")
