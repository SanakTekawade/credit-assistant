import datetime
from pydantic import BaseModel, field_validator
from typing import List, Optional

class DebtCreate(BaseModel):
    name: str
    type: str # Personal Loan, Home Loan, Education Loan, Vehicle Loan, Credit Card, Other
    principal: float
    outstanding: float
    interest_rate: float
    emi: float
    due_date: int = 1
    remaining_months: int = 12

    @field_validator("name")
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Debt name cannot be empty")
        return v.strip()

    @field_validator("principal", "outstanding", "interest_rate", "emi")
    def validate_non_negative(cls, v):
        if v < 0:
            raise ValueError("Amount or rate cannot be negative")
        return v

    @field_validator("due_date")
    def validate_due_date(cls, v):
        if v < 1 or v > 31:
            raise ValueError("Due date must be a valid day of the month (1-31)")
        return v

class DebtUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    principal: Optional[float] = None
    outstanding: Optional[float] = None
    interest_rate: Optional[float] = None
    emi: Optional[float] = None
    due_date: Optional[int] = None
    remaining_months: Optional[int] = None

class DebtResponse(BaseModel):
    id: int
    user_id: int
    name: str
    type: str
    principal: float
    outstanding: float
    interest_rate: float
    emi: float
    due_date: int
    remaining_months: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class DebtSummaryResponse(BaseModel):
    total_outstanding: float
    total_monthly_emi: float
    debts_count: int
    debts: List[DebtResponse]
