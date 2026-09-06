from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .database import Base, engine
from .routes import auth, trips, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Voyage Weaver API",
    version="1.0.0",
    description="Backend API for Voyage Weaver travel planning.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(trips.router, prefix="/api")
app.include_router(ai.router, prefix="/api")


@app.get("/")
def root():
    return {"name": "Voyage Weaver API", "status": "online"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
