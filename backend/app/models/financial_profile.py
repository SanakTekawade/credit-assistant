import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Income
    monthly_income = Column(Float, default=0.0)
    other_income = Column(Float, default=0.0)
    
    # Expenses Breakdown
    rent = Column(Float, default=0.0)
    utilities = Column(Float, default=0.0)
    food = Column(Float, default=0.0)
    transport = Column(Float, default=0.0)
    other_expenses = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    
    # Credit Details
    credit_score = Column(Integer, default=700)
    previous_credit_score = Column(Integer, default=700)
    total_credit_limit = Column(Float, default=0.0)
    credit_used = Column(Float, default=0.0)
    active_credit_cards = Column(Integer, default=0)
    active_loans = Column(Integer, default=0)
    outstanding_debt = Column(Float, default=0.0)
    monthly_emi = Column(Float, default=0.0)
    missed_payments = Column(Integer, default=0)
    
    # Derived Ratios
    dti = Column(Float, default=0.0) # Debt to income %
    credit_utilization = Column(Float, default=0.0) # Utilization %
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="financial_profile")
