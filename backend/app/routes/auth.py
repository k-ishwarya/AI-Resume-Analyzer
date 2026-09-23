from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_reset_token,
    decode_reset_token,
    verify_reset_token,
)
from app.core.deps import get_current_user
from app.services.email_service import send_password_reset_email
from app.core.limiter import limiter


router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: UserRegister, db: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Check existing user
    existing_user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # First user can be registered as USER. Admin is seeded or can be assigned.
    email_clean = payload.email.lower().strip()
    role = "ADMIN" if email_clean == "ishwaryak1305@gmail.com" else "USER"
    
    user = User(
        name=payload.name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    if user.email == "ishwaryak1305@gmail.com" and user.role != "ADMIN":
        user.role = "ADMIN"
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    # If account exists, generate token with password fingerprint and dispatch email
    if user:
        reset_token = create_reset_token(user.email, password_hash=user.password_hash)
        send_password_reset_email(to_email=user.email, reset_token=reset_token, user_name=user.name)

    # Standard security practice: return success message without exposing if email exists
    return {
        "message": "If an account exists with that email address, a password reset link has been sent. Please check your inbox or spam folder.",
        "email": email_clean
    }

@router.post("/reset-password")
@limiter.limit("3/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation password do not match."
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    payload_data = decode_reset_token(payload.token)
    if not payload_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired. Please request a new password reset."
        )

    email = payload_data.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found."
        )

    # Verify fingerprint against current password hash (prevents replay/reuse of used tokens)
    if not verify_reset_token(payload.token, current_password_hash=user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link has already been used. Please request a new link if needed."
        )

    user.password_hash = hash_password(payload.new_password)
    db.commit()

    return {
        "message": "Your password has been successfully updated! You can now sign in with your new password."
    }


