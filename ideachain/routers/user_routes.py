from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/api/user", tags=["User"])

@router.get("/profile")
def get_user_profile(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Fetch ideas submitted
    ideas = db.query(models.Idea).filter(models.Idea.user_id == current_user.id).all()
    
    # Fetch collab requests sent
    sent_requests = db.query(models.CollabRequest).filter(models.CollabRequest.sender_id == current_user.id).all()
    
    # Fetch collab requests received
    received_requests = db.query(models.CollabRequest).filter(models.CollabRequest.receiver_id == current_user.id).all()
    
    return {
        "user": current_user,
        "submitted_ideas": ideas,
        "sent_requests": sent_requests,
        "received_requests": received_requests
    }

@router.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_user_notifications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.timestamp.desc()).all()
    return notifs

@router.post("/notifications/read")
def mark_notifications_read(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success"}
