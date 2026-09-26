import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.financial_profile import FinancialProfile
from ..models.credit_history import CreditHistory
from ..models.notification import Notification
from ..schemas.credit import (
    CreditSummaryResponse,
    CreditHistoryResponse,
    CreditHistoryItem,
    CreditScoreUpdate
)
from ..auth.dependencies import get_current_user
from ..services.financial_service import (
    get_or_create_profile,
    format_credit_summary_response,
    update_profile_calculations
)

router = APIRouter(prefix="/credit", tags=["Credit Management"])

@router.get("/summary", response_model=CreditSummaryResponse)
def get_credit_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    return format_credit_summary_response(profile)

@router.get("/history", response_model=CreditHistoryResponse)
def get_credit_history(
    timeframe: str = Query("all", enum=["1m", "3m", "6m", "1y", "all"]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CreditHistory).filter(CreditHistory.user_id == current_user.id)
    now = datetime.datetime.utcnow()

    if timeframe == "1m":
        cutoff = now - datetime.timedelta(days=30)
        query = query.filter(CreditHistory.recorded_at >= cutoff)
    elif timeframe == "3m":
        cutoff = now - datetime.timedelta(days=90)
        query = query.filter(CreditHistory.recorded_at >= cutoff)
    elif timeframe == "6m":
        cutoff = now - datetime.timedelta(days=180)
        query = query.filter(CreditHistory.recorded_at >= cutoff)
    elif timeframe == "1y":
        cutoff = now - datetime.timedelta(days=365)
        query = query.filter(CreditHistory.recorded_at >= cutoff)

    records = query.order_by(CreditHistory.recorded_at.asc()).all()

    # If no records or only 1 record, ensure current profile score is shown
    if not records:
        profile = get_or_create_profile(db, current_user)
        items = [
            CreditHistoryItem(
                id=1,
                credit_score=profile.credit_score,
                credit_utilization=profile.credit_utilization,
                dti=profile.dti,
                note="Initial Baseline",
                recorded_at=profile.updated_at,
                formatted_date=profile.updated_at.strftime("%b %Y")
            )
        ]
    else:
        items = [
            CreditHistoryItem(
                id=r.id,
                credit_score=r.credit_score,
                credit_utilization=r.credit_utilization,
                dti=r.dti,
                note=r.note,
                recorded_at=r.recorded_at,
                formatted_date=r.recorded_at.strftime("%b %d, %Y" if timeframe in ["1m", "3m"] else "%b %Y")
            )
            for r in records
        ]

    return CreditHistoryResponse(
        history=items,
        timeframe=timeframe
    )

@router.post("/score", response_model=CreditSummaryResponse)
def update_credit_score(
    req: CreditScoreUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user)
    old_score = profile.credit_score
    profile.previous_credit_score = old_score
    profile.credit_score = req.credit_score

    update_profile_calculations(profile, db, log_history=True, note=req.note or "Manual Score Update")
    db.commit()

    diff = req.credit_score - old_score
    if diff != 0:
        notif = Notification(
            user_id=current_user.id,
            title="Credit Score Updated",
            message=f"New credit score recorded: {req.credit_score} ({'+' if diff > 0 else ''}{diff} pts).",
            type="success" if diff > 0 else "info"
        )
        db.add(notif)
        db.commit()

    return format_credit_summary_response(profile)
