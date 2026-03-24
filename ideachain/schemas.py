from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth & User ---
class UserCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    identifier: str # Email or phone
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str

    class Config:
        from_attributes = True

# --- Idea ---
class IdeaCreate(BaseModel):
    title: str
    description: str
    category: str

class IdeaResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class IdeaSubmissionResponse(BaseModel):
    idea: IdeaResponse
    similarity_percentage: float
    risk_level: str
    message: str

# --- Collaboration ---
class CollabRequestCreate(BaseModel):
    idea_id: int

class CollabRequestResponse(BaseModel):
    id: int
    idea_id: int
    sender_id: int
    receiver_id: int
    status: str

    class Config:
        from_attributes = True

class RecruitmentPostCreate(BaseModel):
    idea_id: int
    total_vacancies: int
    required_roles: str

class RecruitmentPostResponse(BaseModel):
    id: int
    idea_id: int
    total_vacancies: int
    required_roles: str
    created_by: int

    class Config:
        from_attributes = True

# --- Notifications ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    message: str
    is_read: bool
    timestamp: datetime

    class Config:
        from_attributes = True
