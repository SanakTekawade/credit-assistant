import datetime
from pydantic import BaseModel
from typing import List, Optional

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info" # info, warning, success, alert, milestone

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime.datetime
    time_ago: Optional[str] = None

    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    unread_count: int
    notifications: List[NotificationResponse]
