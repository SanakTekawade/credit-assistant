import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.notification import Notification
from ..schemas.notification import (
    NotificationListResponse,
    NotificationResponse
)
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def format_time_ago(dt: datetime.datetime) -> str:
    now = datetime.datetime.utcnow()
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"

@router.get("", response_model=NotificationListResponse)
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(25)
        .all()
    )
    unread_count = sum(1 for n in notifs if not n.is_read)

    formatted = []
    for n in notifs:
        item = NotificationResponse.model_validate(n)
        item.time_ago = format_time_ago(n.created_at)
        formatted.append(item)

    return NotificationListResponse(
        unread_count=unread_count,
        notifications=formatted
    )

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    
    item = NotificationResponse.model_validate(notif)
    item.time_ago = format_time_ago(notif.created_at)
    return item

@router.put("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}
