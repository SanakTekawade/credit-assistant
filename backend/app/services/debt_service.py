from sqlalchemy.orm import Session
from ..models.debt import Debt
from ..models.financial_profile import FinancialProfile
from .financial_service import update_profile_calculations

def sync_debts_to_profile(db: Session, user_id: int):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
    if not profile:
        return
    
    debts = db.query(Debt).filter(Debt.user_id == user_id).all()
    total_outstanding = sum(d.outstanding for d in debts)
    total_emi = sum(d.emi for d in debts)
    
    profile.outstanding_debt = total_outstanding
    profile.monthly_emi = total_emi
    profile.active_loans = len([d for d in debts if d.type != "Credit Card"])
    
    update_profile_calculations(profile, db, log_history=False)
