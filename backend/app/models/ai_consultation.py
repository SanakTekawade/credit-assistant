import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class AIConsultation(Base):
    __tablename__ = "ai_consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt_summary = Column(Text, nullable=True)
    health_status = Column(String, nullable=True) # Excellent, Good, Fair, Needs Attention, Critical
    summary = Column(Text, nullable=False)
    key_issues_json = Column(Text, default="[]")
    action_plan_json = Column(Text, default="[]")
    warnings_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="ai_consultations")
