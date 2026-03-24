from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database, similarity

router = APIRouter(prefix="/api/ideas", tags=["Ideas"])

@router.post("/", response_model=schemas.IdeaSubmissionResponse)
def submit_idea(
    idea: schemas.IdeaCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Fetch all existing idea descriptions
    existing_ideas = db.query(models.Idea).all()
    existing_descriptions = [i.description for i in existing_ideas]
    
    # Analyze similarity
    sim_percentage = similarity.analyze_similarity(idea.description, existing_descriptions)
    
    # Decision logic
    threshold = 70.0
    if sim_percentage > threshold:
        risk_level = "High risk"
        message = "Similar idea already exists"
    else:
        risk_level = "Low risk"
        message = "Idea is relatively unique"

    # Save idea with ownership proof timestamp
    new_idea = models.Idea(
        title=idea.title,
        description=idea.description,
        category=idea.category,
        user_id=current_user.id
        # timestamp is automatically populated
    )
    db.add(new_idea)
    db.commit()
    db.refresh(new_idea)
    
    return {
        "idea": new_idea,
        "similarity_percentage": sim_percentage,
        "risk_level": risk_level,
        "message": message
    }

@router.get("/", response_model=List[schemas.IdeaResponse])
def get_all_ideas(db: Session = Depends(database.get_db)):
    return db.query(models.Idea).all()
