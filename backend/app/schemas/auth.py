import re
import datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip()

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("confirm_password")
    def passwords_match(cls, v, values):
        # In pydantic v2, we check values.data
        if "password" in values.data and v != values.data["password"]:
            raise ValueError("Passwords do not match")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    employment_status: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("New password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("New password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("New password must contain at least one number")
        return v

    @field_validator("confirm_password")
    def passwords_match(cls, v, values):
        if "new_password" in values.data and v != values.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    city: Optional[str] = None
    employment_status: Optional[str] = None
    is_onboarded: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
