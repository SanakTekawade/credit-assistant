import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Debt(Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # Personal Loan, Home Loan, Education Loan, Vehicle Loan, Credit Card, Other
    principal = Column(Float, default=0.0)
    outstanding = Column(Float, default=0.0)
    interest_rate = Column(Float, default=0.0)
    emi = Column(Float, default=0.0)
    due_date = Column(Integer, default=1) # Day of the month (1-31)
    remaining_months = Column(Integer, default=12)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="debts")
