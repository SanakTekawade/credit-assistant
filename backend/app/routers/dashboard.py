import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.financial_profile import FinancialProfile
from ..models.debt import Debt
from ..models.ai_consultation import AIConsultation
from ..models.notification import Notification
from ..schemas.dashboard import DashboardResponse, RoadmapResponse
from ..schemas.ai import AIAnalysisResponse, ActionPlanStep
from ..auth.dependencies import get_current_user
from ..services.financial_service import (
    get_or_create_profile,
    format_financial_profile_response,
    format_credit_summary_response
)
from ..services.roadmap_service import calculate_roadmap_status
from ..routers.debts import get_debts

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    formatted_profile = format_financial_profile_response(profile)
    credit_summary = format_credit_summary_response(profile)
    debt_summary = get_debts(current_user, db)

    # Roadmap progress
    roadmap_data = calculate_roadmap_status(current_user, db)

    # Unread notifications count
    unread_count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .count()
    )

    # Latest AI analysis
    latest_consultation = (
        db.query(AIConsultation)
        .filter(AIConsultation.user_id == current_user.id)
        .order_by(AIConsultation.created_at.desc())
        .first()
    )

    latest_ai_response = None
    if latest_consultation:
        try:
            key_issues = json.loads(latest_consultation.key_issues_json) if latest_consultation.key_issues_json else []
        except Exception:
            key_issues = []

        try:
            plan_raw = json.loads(latest_consultation.action_plan_json) if latest_consultation.action_plan_json else []
            action_plan = [ActionPlanStep(**p) for p in plan_raw]
        except Exception:
            action_plan = []

        try:
            warnings = json.loads(latest_consultation.warnings_json) if latest_consultation.warnings_json else []
        except Exception:
            warnings = []

        latest_ai_response = AIAnalysisResponse(
            summary=latest_consultation.summary,
            health_status=latest_consultation.health_status or "Good",
            key_issues=key_issues,
            action_plan=action_plan,
            warnings=warnings,
            created_at=latest_consultation.created_at
        )

    return DashboardResponse(
        user_name=current_user.name,
        email=current_user.email,
        city=current_user.city,
        employment_status=current_user.employment_status,
        is_onboarded=current_user.is_onboarded,
        profile=formatted_profile,
        credit_summary=credit_summary,
        debt_summary=debt_summary,
        latest_ai_analysis=latest_ai_response,
        unread_notifications_count=unread_count,
        roadmap_progress=roadmap_data.overall_progress
    )

@router.get("/roadmap", response_model=RoadmapResponse)
def get_roadmap_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return calculate_roadmap_status(current_user, db)
