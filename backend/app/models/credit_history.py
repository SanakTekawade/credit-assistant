import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class CreditHistory(Base):
    __tablename__ = "credit_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    credit_score = Column(Integer, nullable=False)
    credit_utilization = Column(Float, default=0.0)
    dti = Column(Float, default=0.0)
    note = Column(String, nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="credit_histories")
