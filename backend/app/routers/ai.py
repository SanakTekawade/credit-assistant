import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.financial_profile import FinancialProfile
from ..models.ai_consultation import AIConsultation
from ..models.notification import Notification
from ..models.debt import Debt
from ..schemas.ai import (
    AIAnalysisRequest,
    AIAnalysisResponse,
    AIConsultationHistoryItem,
    ActionPlanStep
)
from ..auth.dependencies import get_current_user
from ..services.financial_service import get_or_create_profile
from ..ai.gemini_service import analyze_credit_health

router = APIRouter(prefix="/ai", tags=["AI Advisor"])

@router.post("/analyze", response_model=AIAnalysisResponse)
def run_ai_consultation(
    req: AIAnalysisRequest = AIAnalysisRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    debts = db.query(Debt).filter(Debt.user_id == current_user.id).all()

    # Package real user metrics
    metrics = {
        "credit_score": profile.credit_score,
        "dti": profile.dti,
        "credit_utilization": profile.credit_utilization,
        "monthly_income": profile.monthly_income,
        "other_income": profile.other_income,
        "monthly_expenses": profile.monthly_expenses,
        "monthly_emi": profile.monthly_emi,
        "outstanding_debt": profile.outstanding_debt,
        "credit_used": profile.credit_used,
        "total_credit_limit": profile.total_credit_limit,
        "active_credit_cards": profile.active_credit_cards,
        "active_loans": profile.active_loans or len(debts),
        "missed_payments": profile.missed_payments,
        "employment_status": current_user.employment_status or "Salaried",
        "city": current_user.city or "India"
    }

    # Generate analysis via Gemini / rule-based fallback
    ai_result = analyze_credit_health(metrics)

    # Persist in database
    consultation = AIConsultation(
        user_id=current_user.id,
        prompt_summary=f"Score: {profile.credit_score}, DTI: {profile.dti}%, Utilization: {profile.credit_utilization}%",
        health_status=ai_result.health_status,
        summary=ai_result.summary,
        key_issues_json=json.dumps(ai_result.key_issues),
        action_plan_json=json.dumps([step.model_dump() for step in ai_result.action_plan]),
        warnings_json=json.dumps(ai_result.warnings)
    )
    db.add(consultation)
    
    # Notification
    notif = Notification(
        user_id=current_user.id,
        title="AI Credit Analysis Ready 🤖",
        message=f"Your personalized 5-step action plan has been generated with health status '{ai_result.health_status}'.",
        type="milestone"
    )
    db.add(notif)
    db.commit()

    return ai_result

@router.get("/history", response_model=List[AIConsultationHistoryItem])
def get_ai_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultations = (
        db.query(AIConsultation)
        .filter(AIConsultation.user_id == current_user.id)
        .order_by(AIConsultation.created_at.desc())
        .limit(10)
        .all()
    )

    items = []
    for c in consultations:
        try:
            key_issues = json.loads(c.key_issues_json) if c.key_issues_json else []
        except Exception:
            key_issues = []

        try:
            plan_raw = json.loads(c.action_plan_json) if c.action_plan_json else []
            action_plan = [ActionPlanStep(**p) for p in plan_raw]
        except Exception:
            action_plan = []

        try:
            warnings = json.loads(c.warnings_json) if c.warnings_json else []
        except Exception:
            warnings = []

        items.append(
            AIConsultationHistoryItem(
                id=c.id,
                health_status=c.health_status,
                summary=c.summary,
                key_issues=key_issues,
                action_plan=action_plan,
                warnings=warnings,
                created_at=c.created_at
            )
        )
    return items
