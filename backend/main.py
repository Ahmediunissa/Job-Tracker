import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List
from datetime import date, datetime

# Production-ready database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./jobtracker.db")

# Railway provides PostgreSQL URLs starting with postgres://, but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://")

# Different connection args for PostgreSQL vs SQLite
if DATABASE_URL.startswith("postgresql://"):
    engine = create_engine(DATABASE_URL, echo=True)
else:
    engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

# Models
class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    company: str
    role: str
    date_applied: Optional[date] = None
    status: str = "Applied"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# FastAPI app
app = FastAPI(title="Job Application Tracker API")

# Production CORS settings - will be updated after frontend deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Temporarily allow all origins - update this after frontend deployment
        "http://localhost:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002"
    ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables on startup
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# Health check endpoint for Railway
@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Job Tracker API is running"}

# Dependency
def get_session():
    with Session(engine) as session:
        yield session

# CRUD Operations
@app.post("/applications", response_model=Application)
def create_application(app_in: Application, session: Session = Depends(get_session)):
    # Convert string date to Python date object if provided
    if app_in.date_applied and isinstance(app_in.date_applied, str):
        app_in.date_applied = datetime.strptime(app_in.date_applied, "%Y-%m-%d").date()
    
    session.add(app_in)
    session.commit()
    session.refresh(app_in)
    return app_in

@app.get("/applications", response_model=List[Application])
def list_applications(session: Session = Depends(get_session)):
    return session.exec(select(Application)).all()

@app.get("/applications/{app_id}", response_model=Application)
def get_application(app_id: int, session: Session = Depends(get_session)):
    app_obj = session.get(Application, app_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return app_obj

@app.put("/applications/{app_id}", response_model=Application)
def update_application(app_id: int, app_in: Application, session: Session = Depends(get_session)):
    # Handle date conversion for updates too
    if hasattr(app_in, 'date_applied') and app_in.date_applied and isinstance(app_in.date_applied, str):
        app_in.date_applied = datetime.strptime(app_in.date_applied, "%Y-%m-%d").date()
    
    app_obj = session.get(Application, app_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    
    app_data = app_in.dict(exclude_unset=True)
    for key, value in app_data.items():
        setattr(app_obj, key, value)
    
    session.add(app_obj)
    session.commit()
    session.refresh(app_obj)
    return app_obj

@app.delete("/applications/{app_id}", status_code=204)
def delete_application(app_id: int, session: Session = Depends(get_session)):
    app_obj = session.get(Application, app_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(app_obj)
    session.commit()
    return None