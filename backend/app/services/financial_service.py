import datetime
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.financial_profile import FinancialProfile
from ..models.credit_history import CreditHistory
from ..models.notification import Notification
from ..schemas.financial_profile import FinancialProfileResponse, FinancialProfileUpdate, OnboardingRequest
from ..schemas.credit import CreditSummaryResponse
from .calculations import (
    calculate_dti,
    calculate_credit_utilization,
    get_credit_score_category,
    calculate_delta
)

def get_or_create_profile(db: Session, user: User) -> FinancialProfile:
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    if not profile:
        profile = FinancialProfile(
            user_id=user.id,
            monthly_income=50000.0,
            other_income=0.0,
            monthly_expenses=20000.0,
            rent=10000.0,
            utilities=3000.0,
            food=5000.0,
            transport=2000.0,
            other_expenses=0.0,
            credit_score=700,
            previous_credit_score=700,
            total_credit_limit=100000.0,
            credit_used=25000.0,
            active_credit_cards=1,
            active_loans=0,
            outstanding_debt=0.0,
            monthly_emi=0.0,
            missed_payments=0,
            dti=0.0,
            credit_utilization=25.0
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Add initial credit history point
        history = CreditHistory(
            user_id=user.id,
            credit_score=profile.credit_score,
            credit_utilization=profile.credit_utilization,
            dti=profile.dti,
            note="Initial Profile Setup",
            recorded_at=datetime.datetime.utcnow()
        )
        db.add(history)
        db.commit()
    return profile

def update_profile_calculations(profile: FinancialProfile, db: Session, log_history: bool = True, note: str = "Profile Updated") -> FinancialProfile:
    total_income = (profile.monthly_income or 0.0) + (profile.other_income or 0.0)
    monthly_debt_payments = profile.monthly_emi or 0.0
    
    # Calculate DTI
    dti, _ = calculate_dti(monthly_debt_payments, total_income)
    profile.dti = dti
    
    # Calculate Credit Utilization
    utilization, _, _ = calculate_credit_utilization(profile.credit_used or 0.0, profile.total_credit_limit or 0.0)
    profile.credit_utilization = utilization
    
    # Total expenses
    profile.monthly_expenses = (
        (profile.rent or 0.0) +
        (profile.utilities or 0.0) +
        (profile.food or 0.0) +
        (profile.transport or 0.0) +
        (profile.other_expenses or 0.0)
    )
    
    profile.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(profile)
    
    if log_history:
        history = CreditHistory(
            user_id=profile.user_id,
            credit_score=profile.credit_score,
            credit_utilization=profile.credit_utilization,
            dti=profile.dti,
            note=note,
            recorded_at=datetime.datetime.utcnow()
        )
        db.add(history)
        db.commit()
        
    return profile

def format_financial_profile_response(profile: FinancialProfile) -> FinancialProfileResponse:
    _, dti_category = calculate_dti(profile.monthly_emi, (profile.monthly_income + profile.other_income))
    _, available_credit, util_category = calculate_credit_utilization(profile.credit_used, profile.total_credit_limit)
    score_category, _ = get_credit_score_category(profile.credit_score)
    
    return FinancialProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        monthly_income=profile.monthly_income,
        other_income=profile.other_income,
        rent=profile.rent,
        utilities=profile.utilities,
        food=profile.food,
        transport=profile.transport,
        other_expenses=profile.other_expenses,
        monthly_expenses=profile.monthly_expenses,
        credit_score=profile.credit_score,
        previous_credit_score=profile.previous_credit_score,
        total_credit_limit=profile.total_credit_limit,
        credit_used=profile.credit_used,
        available_credit=available_credit,
        active_credit_cards=profile.active_credit_cards,
        active_loans=profile.active_loans,
        outstanding_debt=profile.outstanding_debt,
        monthly_emi=profile.monthly_emi,
        missed_payments=profile.missed_payments,
        dti=profile.dti,
        credit_utilization=profile.credit_utilization,
        dti_category=dti_category,
        utilization_category=util_category,
        score_category=score_category,
        updated_at=profile.updated_at
    )

def format_credit_summary_response(profile: FinancialProfile) -> CreditSummaryResponse:
    score_category, category_color = get_credit_score_category(profile.credit_score)
    score_delta, score_status = calculate_delta(profile.credit_score, profile.previous_credit_score)
    _, dti_category = calculate_dti(profile.monthly_emi, (profile.monthly_income + profile.other_income))
    available_credit = max(0.0, profile.total_credit_limit - profile.credit_used)
    
    return CreditSummaryResponse(
        current_score=profile.credit_score,
        previous_score=profile.previous_credit_score,
        score_delta=int(score_delta),
        score_status=score_status,
        category=score_category,
        category_color=category_color,
        utilization_percentage=profile.credit_utilization,
        total_credit_limit=profile.total_credit_limit,
        credit_used=profile.credit_used,
        available_credit=available_credit,
        dti_percentage=profile.dti,
        dti_category=dti_category,
        monthly_emi=profile.monthly_emi,
        outstanding_debt=profile.outstanding_debt,
        missed_payments=profile.missed_payments,
        last_updated=profile.updated_at,
        educational_disclaimer="Scores and ranges displayed are for personal educational tracking. Exact scoring models and approval criteria vary across Indian credit bureaus (e.g. CIBIL, Experian, CRIF High Mark) and lending institutions."
    )
