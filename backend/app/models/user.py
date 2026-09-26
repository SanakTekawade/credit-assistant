import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    city = Column(String, nullable=True)
    employment_status = Column(String, nullable=True) # Salaried, Self-Employed, Business, Student, Freelancer
    is_onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    credit_histories = relationship("CreditHistory", back_populates="user", cascade="all, delete-orphan", order_by="CreditHistory.recorded_at.asc()")
    debts = relationship("Debt", back_populates="user", cascade="all, delete-orphan")
    ai_consultations = relationship("AIConsultation", back_populates="user", cascade="all, delete-orphan", order_by="AIConsultation.created_at.desc()")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan", order_by="Notification.created_at.desc()")
