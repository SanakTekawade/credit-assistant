from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.financial_profile import FinancialProfile
from ..models.credit_history import CreditHistory
from ..models.notification import Notification
from ..schemas.financial_profile import (
    FinancialProfileResponse,
    FinancialProfileUpdate,
    OnboardingRequest,
    DtiResponse,
    UtilizationResponse,
    ImprovementDeltaResponse
)
from ..auth.dependencies import get_current_user
from ..services.financial_service import (
    get_or_create_profile,
    update_profile_calculations,
    format_financial_profile_response
)
from ..services.calculations import (
    calculate_dti,
    calculate_credit_utilization,
    calculate_delta
)

router = APIRouter(prefix="/profile", tags=["Financial Profile"])

@router.get("/financial", response_model=FinancialProfileResponse)
def get_financial_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    return format_financial_profile_response(profile)

@router.post("/financial", response_model=FinancialProfileResponse)
def complete_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user basic profile
    if req.age is not None:
        current_user.age = req.age
    if req.city:
        current_user.city = req.city.strip()
    if req.employment_status:
        current_user.employment_status = req.employment_status.strip()
    current_user.is_onboarded = True

    # Get or create profile
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)

    # Populate values
    profile.monthly_income = req.monthly_income
    profile.other_income = req.other_income or 0.0
    profile.rent = req.rent or 0.0
    profile.utilities = req.utilities or 0.0
    profile.food = req.food or 0.0
    profile.transport = req.transport or 0.0
    profile.other_expenses = req.other_expenses or 0.0
    
    profile.previous_credit_score = req.credit_score
    profile.credit_score = req.credit_score
    profile.total_credit_limit = req.total_credit_limit
    profile.credit_used = req.credit_used
    profile.active_credit_cards = req.active_credit_cards or 0
    profile.active_loans = req.active_loans or 0
    profile.outstanding_debt = req.outstanding_debt or 0.0
    profile.monthly_emi = req.monthly_emi or 0.0
    profile.missed_payments = req.missed_payments or 0

    # Calculate ratios and save
    update_profile_calculations(profile, db, log_history=True, note="Initial Onboarding Assessment")
    db.commit()

    # Create celebration notification
    notif = Notification(
        user_id=current_user.id,
        title="Onboarding Completed! 🚀",
        message=f"Your initial credit baseline has been established at {profile.credit_score} with a DTI of {profile.dti}%. Explore your dashboard and generate your 5-step AI action plan.",
        type="success"
    )
    db.add(notif)
    db.commit()

    return format_financial_profile_response(profile)

@router.put("/financial", response_model=FinancialProfileResponse)
def update_financial_profile(
    req: FinancialProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    
    old_score = profile.credit_score
    old_dti = profile.dti
    old_utilization = profile.credit_utilization

    # Update user details if present
    if req.age is not None:
        current_user.age = req.age
    if req.city is not None:
        current_user.city = req.city.strip()
    if req.employment_status is not None:
        current_user.employment_status = req.employment_status.strip()

    # Update profile fields if present
    if req.monthly_income is not None:
        profile.monthly_income = req.monthly_income
    if req.other_income is not None:
        profile.other_income = req.other_income
    if req.rent is not None:
        profile.rent = req.rent
    if req.utilities is not None:
        profile.utilities = req.utilities
    if req.food is not None:
        profile.food = req.food
    if req.transport is not None:
        profile.transport = req.transport
    if req.other_expenses is not None:
        profile.other_expenses = req.other_expenses
    
    if req.credit_score is not None:
        profile.previous_credit_score = old_score
        profile.credit_score = req.credit_score

    if req.total_credit_limit is not None:
        profile.total_credit_limit = req.total_credit_limit
    if req.credit_used is not None:
        profile.credit_used = req.credit_used
    if req.active_credit_cards is not None:
        profile.active_credit_cards = req.active_credit_cards
    if req.active_loans is not None:
        profile.active_loans = req.active_loans
    if req.outstanding_debt is not None:
        profile.outstanding_debt = req.outstanding_debt
    if req.monthly_emi is not None:
        profile.monthly_emi = req.monthly_emi
    if req.missed_payments is not None:
        profile.missed_payments = req.missed_payments

    update_profile_calculations(profile, db, log_history=True, note="Financial Profile Update")
    db.commit()

    # Check for meaningful changes and trigger notification
    score_diff = profile.credit_score - old_score
    if score_diff != 0:
        status_word = "increased" if score_diff > 0 else "decreased"
        notif = Notification(
            user_id=current_user.id,
            title="Credit Score Change Recorded",
            message=f"Your credit score has {status_word} by {abs(score_diff)} points (from {old_score} to {profile.credit_score}).",
            type="success" if score_diff > 0 else "warning"
        )
        db.add(notif)
        db.commit()

    return format_financial_profile_response(profile)

@router.get("/dti", response_model=DtiResponse)
def get_dti_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    gross_income = profile.monthly_income + profile.other_income
    dti, category = calculate_dti(profile.monthly_emi, gross_income)
    
    educational_note = (
        "Debt-to-Income (DTI) compares your total monthly debt payments against gross monthly income. "
        "In Indian retail banking, lenders typically prefer a DTI below 40-43% for prime home loan and personal loan approvals. "
        "This metric is for educational budgeting purposes and does not represent an official credit bureau score."
    )
    
    return DtiResponse(
        dti=dti,
        category=category,
        monthly_debt_payments=profile.monthly_emi,
        monthly_gross_income=gross_income,
        educational_note=educational_note
    )

@router.get("/utilization", response_model=UtilizationResponse)
def get_utilization_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    utilization, available_credit, category = calculate_credit_utilization(
        profile.credit_used,
        profile.total_credit_limit
    )
    
    if utilization <= 30.0:
        recommendation = "Great job! Your credit utilization is in the optimal zone (< 30%), which supports a positive credit standing."
    elif utilization <= 50.0:
        recommendation = "Your utilization is moderate. Paying down revolving credit card balances before your statement date will help boost your score."
    else:
        recommendation = "High credit card utilization detected. Aim to bring your total revolving balance under 30% of your total credit limit to minimize score penalties."

    return UtilizationResponse(
        credit_utilization=utilization,
        total_credit_limit=profile.total_credit_limit,
        credit_used=profile.credit_used,
        available_credit=available_credit,
        category=category,
        recommendation=recommendation
    )

@router.get("/improvement-delta", response_model=ImprovementDeltaResponse)
def get_improvement_delta(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    score_delta, score_status = calculate_delta(profile.credit_score, profile.previous_credit_score)
    
    # Check second most recent history for dti/util delta
    histories = db.query(CreditHistory).filter(CreditHistory.user_id == current_user.id).order_by(CreditHistory.recorded_at.desc()).limit(2).all()
    
    if len(histories) >= 2:
        prev_h = histories[1]
        dti_delta, dti_status = calculate_delta(profile.dti, prev_h.dti, is_lower_better=True)
        util_delta, util_status = calculate_delta(profile.credit_utilization, prev_h.credit_utilization, is_lower_better=True)
    else:
        dti_delta, dti_status = 0.0, "No change"
        util_delta, util_status = 0.0, "No change"

    return ImprovementDeltaResponse(
        score_delta=int(score_delta),
        score_status=score_status,
        dti_delta=dti_delta,
        dti_status=dti_status,
        utilization_delta=util_delta,
        utilization_status=util_status,
        last_updated=profile.updated_at
    )
