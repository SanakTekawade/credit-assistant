from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.debt import Debt
from ..models.notification import Notification
from ..schemas.debt import (
    DebtCreate,
    DebtUpdate,
    DebtResponse,
    DebtSummaryResponse
)
from ..auth.dependencies import get_current_user
from ..services.debt_service import sync_debts_to_profile

router = APIRouter(prefix="/debts", tags=["Debts and Loans"])

@router.get("", response_model=DebtSummaryResponse)
def get_debts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debts = db.query(Debt).filter(Debt.user_id == current_user.id).order_by(Debt.outstanding.desc()).all()
    total_outstanding = sum(d.outstanding for d in debts)
    total_emi = sum(d.emi for d in debts)

    return DebtSummaryResponse(
        total_outstanding=round(total_outstanding, 2),
        total_monthly_emi=round(total_emi, 2),
        debts_count=len(debts),
        debts=[DebtResponse.model_validate(d) for d in debts]
    )

@router.post("", response_model=DebtResponse, status_code=status.HTTP_201_CREATED)
def create_debt(
    req: DebtCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debt = Debt(
        user_id=current_user.id,
        name=req.name,
        type=req.type,
        principal=req.principal,
        outstanding=req.outstanding,
        interest_rate=req.interest_rate,
        emi=req.emi,
        due_date=req.due_date,
        remaining_months=req.remaining_months
    )
    db.add(debt)
    db.commit()
    db.refresh(debt)

    # Sync totals into user financial profile
    sync_debts_to_profile(db, current_user.id)

    # Notification
    notif = Notification(
        user_id=current_user.id,
        title="New Debt Record Added",
        message=f"Added '{debt.name}' ({debt.type}) with outstanding amount of ₹{debt.outstanding:,.0f} and monthly EMI of ₹{debt.emi:,.0f}.",
        type="info"
    )
    db.add(notif)
    db.commit()

    return DebtResponse.model_validate(debt)

@router.put("/{debt_id}", response_model=DebtResponse)
def update_debt(
    debt_id: int,
    req: DebtUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debt = db.query(Debt).filter(Debt.id == debt_id, Debt.user_id == current_user.id).first()
    if not debt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt record not found"
        )

    if req.name is not None:
        debt.name = req.name.strip()
    if req.type is not None:
        debt.type = req.type
    if req.principal is not None:
        debt.principal = req.principal
    if req.outstanding is not None:
        debt.outstanding = req.outstanding
    if req.interest_rate is not None:
        debt.interest_rate = req.interest_rate
    if req.emi is not None:
        debt.emi = req.emi
    if req.due_date is not None:
        debt.due_date = req.due_date
    if req.remaining_months is not None:
        debt.remaining_months = req.remaining_months

    db.commit()
    db.refresh(debt)

    # Sync totals into profile
    sync_debts_to_profile(db, current_user.id)

    return DebtResponse.model_validate(debt)

@router.delete("/{debt_id}")
def delete_debt(
    debt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debt = db.query(Debt).filter(Debt.id == debt_id, Debt.user_id == current_user.id).first()
    if not debt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt record not found"
        )

    db.delete(debt)
    db.commit()

    # Sync totals into profile
    sync_debts_to_profile(db, current_user.id)

    return {"message": "Debt record successfully deleted"}
