from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models, database
from routers import auth_routes, idea_routes, collab_routes, user_routes

# Create DB Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="IdeaChain - Idea Ownership & Collaboration Platform")

# Allow CORS for easy frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_routes.router)
app.include_router(idea_routes.router)
app.include_router(collab_routes.router)
app.include_router(user_routes.router)

# Mount static files for frontend
app.mount("/", StaticFiles(directory="static", html=True), name="static")
