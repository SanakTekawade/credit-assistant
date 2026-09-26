from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.notification import Notification
from ..schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdate,
    PasswordChangeRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from ..auth.security import hash_password, verify_password, create_access_token
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create user
    user = User(
        name=req.name,
        email=req.email.lower(),
        password_hash=hash_password(req.password),
        is_onboarded=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create welcome notification
    welcome_notif = Notification(
        user_id=user.id,
        title="Welcome to Credit Assistant! 🎉",
        message="Complete your quick financial onboarding to unlock your personalized credit score gauge, DTI analysis, and AI financial guidance.",
        type="milestone"
    )
    db.add(welcome_notif)
    db.commit()

    # Generate JWT token
    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/profile", response_model=UserResponse)
def update_profile(
    req: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.name is not None:
        current_user.name = req.name.strip()
    if req.age is not None:
        current_user.age = req.age
    if req.city is not None:
        current_user.city = req.city.strip()
    if req.employment_status is not None:
        current_user.employment_status = req.employment_status.strip()

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.post("/change-password")
def change_password(
    req: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    current_user.password_hash = hash_password(req.new_password)
    db.commit()

    # Add security notification
    notif = Notification(
        user_id=current_user.id,
        title="Password Updated",
        message="Your account password was successfully changed.",
        type="info"
    )
    db.add(notif)
    db.commit()

    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # Educational response without leaking whether email exists
    return {
        "message": f"If an account is associated with {req.email}, password recovery instructions and a demo reset code ('123456') have been prepared."
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email"
        )
    # Simple simulated OTP verification for recovery
    if req.reset_code != "123456" and len(req.reset_code) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code"
        )

    user.password_hash = hash_password(req.new_password)
    db.commit()
    return {"message": "Password reset successfully. You can now log in with your new password."}

@router.delete("/delete-account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated financial records have been permanently deleted."}
