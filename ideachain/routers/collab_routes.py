from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/api/collab", tags=["Collaboration"])

@router.get("/search", response_model=List[schemas.IdeaResponse])
def search_ideas(
    q: str = Query(None, description="Search term for ideas"),
    category: str = Query(None, description="Filter by category"),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Idea)
    if q:
        query = query.filter(models.Idea.title.contains(q) | models.Idea.description.contains(q))
    if category:
        query = query.filter(models.Idea.category == category)
    return query.all()

@router.post("/requests", response_model=schemas.CollabRequestResponse)
def send_collab_request(
    request: schemas.CollabRequestCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    idea = db.query(models.Idea).filter(models.Idea.id == request.idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
        
    if idea.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send request to your own idea")

    # Check existing request
    existing_req = db.query(models.CollabRequest).filter(
        models.CollabRequest.idea_id == idea.id,
        models.CollabRequest.sender_id == current_user.id
    ).first()
    if existing_req:
        raise HTTPException(status_code=400, detail="Request already sent")

    new_request = models.CollabRequest(
        idea_id=idea.id,
        sender_id=current_user.id,
        receiver_id=idea.user_id
    )
    db.add(new_request)
    
    # Send Notification to receiver
    notif = models.Notification(
        user_id=idea.user_id,
        message=f"{current_user.name} wants to collaborate on your idea '{idea.title}'"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(new_request)
    return new_request

@router.post("/recruitment", response_model=schemas.RecruitmentPostResponse)
def create_recruitment_post(
    post: schemas.RecruitmentPostCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    idea = db.query(models.Idea).filter(models.Idea.id == post.idea_id).first()
    if not idea or idea.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized or idea not found")

    new_post = models.RecruitmentPost(
        idea_id=post.idea_id,
        total_vacancies=post.total_vacancies,
        required_roles=post.required_roles,
        created_by=current_user.id
    )
    db.add(new_post)
    
    # Notify all other users
    all_users = db.query(models.User).filter(models.User.id != current_user.id).all()
    for user in all_users:
        db.add(models.Notification(
            user_id=user.id,
            message=f"New recruitment for '{idea.title}': looking for {post.required_roles}. Vacancies: {post.total_vacancies}"
        ))
        
    db.commit()
    db.refresh(new_post)
    return new_post
