import datetime
from pydantic import BaseModel
from typing import List, Optional
from .financial_profile import FinancialProfileResponse
from .credit import CreditSummaryResponse
from .debt import DebtSummaryResponse
from .ai import AIAnalysisResponse
from .notification import NotificationResponse

class RoadmapTask(BaseModel):
    id: str
    title: str
    description: str
    is_completed: bool

class RoadmapStage(BaseModel):
    stage_number: int
    title: str
    subtitle: str
    description: str
    status: str # completed, in_progress, locked
    completion_percentage: int
    tasks: List[RoadmapTask]

class RoadmapResponse(BaseModel):
    stages: List[RoadmapStage]
    overall_progress: int
    current_stage: int
    disclaimer: str = "Completing roadmap tasks is for personal educational progression and does not guarantee specific credit bureau scoring outcomes."

class DashboardResponse(BaseModel):
    user_name: str
    email: str
    city: Optional[str] = None
    employment_status: Optional[str] = None
    is_onboarded: bool
    profile: Optional[FinancialProfileResponse] = None
    credit_summary: Optional[CreditSummaryResponse] = None
    debt_summary: Optional[DebtSummaryResponse] = None
    latest_ai_analysis: Optional[AIAnalysisResponse] = None
    unread_notifications_count: int = 0
    roadmap_progress: int = 0
    disclaimer: str = "Credit Assistant provides educational personal-finance guidance based on user input. It is not an official credit bureau, bank, or registered financial advisor."
