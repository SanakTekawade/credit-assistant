import datetime
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.financial_profile import FinancialProfile
from ..models.credit_history import CreditHistory
from ..models.debt import Debt
from ..models.ai_consultation import AIConsultation
from ..models.notification import Notification
from ..auth.security import hash_password, create_access_token
from ..schemas.auth import TokenResponse, UserResponse
from ..services.financial_service import update_profile_calculations
from ..ai.gemini_service import analyze_credit_health

router = APIRouter(prefix="/demo", tags=["Demo Account"])

@router.post("/seed", response_model=TokenResponse)
def seed_demo_user(db: Session = Depends(get_db)):
    demo_email = "rahul.sharma@creditassistant.in"
    user = db.query(User).filter(User.email == demo_email).first()

    if user:
        # Clear existing relations
        db.query(Debt).filter(Debt.user_id == user.id).delete()
        db.query(CreditHistory).filter(CreditHistory.user_id == user.id).delete()
        db.query(AIConsultation).filter(AIConsultation.user_id == user.id).delete()
        db.query(Notification).filter(Notification.user_id == user.id).delete()
        db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).delete()
        db.commit()
    else:
        user = User(
            name="Rahul Sharma",
            email=demo_email,
            password_hash=hash_password("Demo1234"),
            age=29,
            city="Bengaluru",
            employment_status="Salaried (Senior Software Engineer)",
            is_onboarded=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    user.is_onboarded = True
    user.age = 29
    user.city = "Bengaluru"
    user.employment_status = "Salaried (Senior Software Engineer)"

    # Financial Profile
    profile = FinancialProfile(
        user_id=user.id,
        monthly_income=75000.0,
        other_income=5000.0,
        rent=16000.0,
        utilities=3500.0,
        food=7500.0,
        transport=3000.0,
        other_expenses=2000.0,
        monthly_expenses=32000.0,
        credit_score=698,
        previous_credit_score=692,
        total_credit_limit=200000.0,
        credit_used=72000.0,
        active_credit_cards=2,
        active_loans=2,
        outstanding_debt=450000.0,
        monthly_emi=15000.0,
        missed_payments=1,
        dti=18.75, # 15000 / 80000
        credit_utilization=36.0 # 72000 / 200000
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # 4 months of historical credit records
    now = datetime.datetime.utcnow()
    histories = [
        CreditHistory(
            user_id=user.id,
            credit_score=680,
            credit_utilization=48.0,
            dti=22.5,
            note="Past Record - 4 Months Ago",
            recorded_at=now - datetime.timedelta(days=120)
        ),
        CreditHistory(
            user_id=user.id,
            credit_score=688,
            credit_utilization=44.0,
            dti=21.0,
            note="Past Record - 3 Months Ago",
            recorded_at=now - datetime.timedelta(days=90)
        ),
        CreditHistory(
            user_id=user.id,
            credit_score=692,
            credit_utilization=40.0,
            dti=19.5,
            note="Past Record - 2 Months Ago",
            recorded_at=now - datetime.timedelta(days=60)
        ),
        CreditHistory(
            user_id=user.id,
            credit_score=698,
            credit_utilization=36.0,
            dti=18.75,
            note="Current Assessment - Recent update",
            recorded_at=now - datetime.timedelta(days=5)
        )
    ]
    db.add_all(histories)

    # Debts
    debts = [
        Debt(
            user_id=user.id,
            name="HDFC Car Loan",
            type="Vehicle Loan",
            principal=350000.0,
            outstanding=240000.0,
            interest_rate=8.75,
            emi=8500.0,
            due_date=5,
            remaining_months=32
        ),
        Debt(
            user_id=user.id,
            name="Axis Bank Personal Loan",
            type="Personal Loan",
            principal=200000.0,
            outstanding=138000.0,
            interest_rate=12.5,
            emi=6500.0,
            due_date=10,
            remaining_months=24
        ),
        Debt(
            user_id=user.id,
            name="ICICI Coral Credit Card",
            type="Credit Card",
            principal=100000.0,
            outstanding=42000.0,
            interest_rate=42.0,
            emi=0.0,
            due_date=18,
            remaining_months=0
        ),
        Debt(
            user_id=user.id,
            name="HDFC Regalia Gold Card",
            type="Credit Card",
            principal=100000.0,
            outstanding=30000.0,
            interest_rate=42.0,
            emi=0.0,
            due_date=25,
            remaining_months=0
        )
    ]
    db.add_all(debts)

    # Initial AI Analysis
    ai_metrics = {
        "credit_score": 698,
        "dti": 18.75,
        "credit_utilization": 36.0,
        "monthly_income": 75000.0,
        "other_income": 5000.0,
        "monthly_expenses": 32000.0,
        "monthly_emi": 15000.0,
        "outstanding_debt": 450000.0,
        "credit_used": 72000.0,
        "total_credit_limit": 200000.0,
        "active_credit_cards": 2,
        "active_loans": 2,
        "missed_payments": 1,
        "employment_status": "Salaried (Senior Software Engineer)",
        "city": "Bengaluru"
    }
    ai_analysis = analyze_credit_health(ai_metrics)
    
    consultation = AIConsultation(
        user_id=user.id,
        prompt_summary="Demo Profile Assessment for Rahul Sharma",
        health_status=ai_analysis.health_status,
        summary=ai_analysis.summary,
        key_issues_json=json.dumps(ai_analysis.key_issues),
        action_plan_json=json.dumps([step.model_dump() for step in ai_analysis.action_plan]),
        warnings_json=json.dumps(ai_analysis.warnings),
        created_at=now - datetime.timedelta(hours=2)
    )
    db.add(consultation)

    # Notifications
    notifications = [
        Notification(
            user_id=user.id,
            title="Demo Account Ready ✨",
            message="Fictional demo data for Rahul Sharma (Score: 698, DTI: 18.8%, Utilization: 36%) has been loaded. Feel free to modify numbers, add debts, or rerun AI analysis.",
            type="milestone",
            is_read=False,
            created_at=now - datetime.timedelta(minutes=5)
        ),
        Notification(
            user_id=user.id,
            title="AI Financial Analysis Ready 🤖",
            message="AI Advisor generated a 5-step action plan to help Rahul target 750+ score over the next 6 months.",
            type="info",
            is_read=False,
            created_at=now - datetime.timedelta(hours=2)
        ),
        Notification(
            user_id=user.id,
            title="Credit Utilization Alert ⚠️",
            message="Your credit utilization is 36.0% (₹72,000 / ₹2,00,000). Bringing this under 30% (₹60,000) will accelerate credit recovery.",
            type="warning",
            is_read=True,
            created_at=now - datetime.timedelta(days=1)
        )
    ]
    db.add_all(notifications)

    db.commit()

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )
