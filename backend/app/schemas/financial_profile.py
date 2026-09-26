import datetime
from pydantic import BaseModel, field_validator
from typing import Optional

class OnboardingRequest(BaseModel):
    # Step 1: Personal
    age: Optional[int] = 28
    city: Optional[str] = "Mumbai"
    employment_status: Optional[str] = "Salaried"
    
    # Step 2: Income
    monthly_income: float
    other_income: Optional[float] = 0.0
    
    # Step 3: Expenses
    rent: Optional[float] = 0.0
    utilities: Optional[float] = 0.0
    food: Optional[float] = 0.0
    transport: Optional[float] = 0.0
    other_expenses: Optional[float] = 0.0
    
    # Step 4: Credit Information
    credit_score: int
    total_credit_limit: float
    credit_used: float
    active_credit_cards: Optional[int] = 1
    active_loans: Optional[int] = 0
    outstanding_debt: Optional[float] = 0.0
    monthly_emi: Optional[float] = 0.0
    missed_payments: Optional[int] = 0

    @field_validator("monthly_income")
    def validate_income(cls, v):
        if v < 0:
            raise ValueError("Monthly income cannot be negative")
        return v

    @field_validator("credit_score")
    def validate_credit_score(cls, v):
        if v < 300 or v > 900:
            raise ValueError("Credit score must be between 300 and 900")
        return v

    @field_validator("total_credit_limit", "credit_used", "outstanding_debt", "monthly_emi")
    def validate_non_negative(cls, v):
        if v < 0:
            raise ValueError("Amount cannot be negative")
        return v

class FinancialProfileUpdate(BaseModel):
    age: Optional[int] = None
    city: Optional[str] = None
    employment_status: Optional[str] = None
    monthly_income: Optional[float] = None
    other_income: Optional[float] = None
    rent: Optional[float] = None
    utilities: Optional[float] = None
    food: Optional[float] = None
    transport: Optional[float] = None
    other_expenses: Optional[float] = None
    credit_score: Optional[int] = None
    total_credit_limit: Optional[float] = None
    credit_used: Optional[float] = None
    active_credit_cards: Optional[int] = None
    active_loans: Optional[int] = None
    outstanding_debt: Optional[float] = None
    monthly_emi: Optional[float] = None
    missed_payments: Optional[int] = None

class DtiResponse(BaseModel):
    dti: float
    category: str # Low (< 30%), Moderate (30% - 43%), High (> 43%)
    monthly_debt_payments: float
    monthly_gross_income: float
    educational_note: str

class UtilizationResponse(BaseModel):
    credit_utilization: float
    total_credit_limit: float
    credit_used: float
    available_credit: float
    category: str # Excellent (< 30%), Moderate (30-50%), High (> 50%)
    recommendation: str

class ImprovementDeltaResponse(BaseModel):
    score_delta: int
    score_status: str # Improved, Declined, No change
    dti_delta: float
    dti_status: str # Improved, Increased, No change
    utilization_delta: float
    utilization_status: str # Improved, Increased, No change
    last_updated: datetime.datetime

class FinancialProfileResponse(BaseModel):
    id: int
    user_id: int
    monthly_income: float
    other_income: float
    rent: float
    utilities: float
    food: float
    transport: float
    other_expenses: float
    monthly_expenses: float
    credit_score: int
    previous_credit_score: int
    total_credit_limit: float
    credit_used: float
    available_credit: float
    active_credit_cards: int
    active_loans: int
    outstanding_debt: float
    monthly_emi: float
    missed_payments: int
    dti: float
    credit_utilization: float
    dti_category: str
    utilization_category: str
    score_category: str
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
