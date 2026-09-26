import datetime
from pydantic import BaseModel, field_validator
from typing import List, Optional

class CreditScoreUpdate(BaseModel):
    credit_score: int
    note: Optional[str] = "Manual score update"

    @field_validator("credit_score")
    def validate_score(cls, v):
        if v < 300 or v > 900:
            raise ValueError("Credit score must be between 300 and 900")
        return v

class CreditHistoryItem(BaseModel):
    id: int
    credit_score: int
    credit_utilization: float
    dti: float
    note: Optional[str] = None
    recorded_at: datetime.datetime
    formatted_date: str

    class Config:
        from_attributes = True

class CreditHistoryResponse(BaseModel):
    history: List[CreditHistoryItem]
    timeframe: str

class CreditSummaryResponse(BaseModel):
    current_score: int
    previous_score: int
    score_delta: int
    score_status: str # Improved, Declined, No change
    category: str # Poor (300-579), Fair (580-669), Good (670-739), Very Good (740-799), Excellent (800-900)
    category_color: str # Red, Orange, Yellow, Blue, Green
    utilization_percentage: float
    total_credit_limit: float
    credit_used: float
    available_credit: float
    dti_percentage: float
    dti_category: str
    monthly_emi: float
    outstanding_debt: float
    missed_payments: int
    last_updated: datetime.datetime
    educational_disclaimer: str
