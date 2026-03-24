from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

import models, schemas, auth, database

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if duplicate email or phone
    db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
    db_user_phone = db.query(models.User).filter(models.User.phone == user.phone).first()

    if db_user_email or db_user_phone:
        raise HTTPException(status_code=400, detail="Email or Phone Number already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        phone=user.phone,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    # Check by email or phone
    user = db.query(models.User).filter(
        (models.User.email == user_credentials.identifier) | 
        (models.User.phone == user_credentials.identifier)
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    if not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
