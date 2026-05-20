# main.py - Punctul de intrare al aplicației FastAPI (Student-Link Backend)

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from contextlib import asynccontextmanager

# Importăm modulele noastre locale
from database import engine, get_db, Base
import models
from auth import router as auth_router
from profile import router as profile_router
from applications import router as applications_router
from company_jobs import router as company_jobs_router

# ---------------------------------------------------------------------------
# 1. LIFESPAN
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    db = next(get_db())
    try:
        if db.query(models.Job).count() == 0:
            joburi_test = [
                models.Job(
                    title="Internship Frontend Developer",
                    company="Bitdefender",
                    location="Cluj-Napoca",
                    description="Cauți primul tău internship în tech? La Bitdefender vei lucra alături de o echipă tânără pe proiecte reale de securitate.",
                    requirements="React, HTML/CSS, JavaScript, Git",
                    job_type="internship"
                ),
                models.Job(
                    title="Junior Python Developer",
                    company="UiPath",
                    location="București (Hybrid)",
                    description="UiPath caută un Junior Python Developer motivat să lucreze pe automatizări și integrări de sisteme.",
                    requirements="Python, REST APIs, SQL, curiozitate tehnică",
                    job_type="junior"
                ),
                models.Job(
                    title="Internship Data Analysis",
                    company="Endava",
                    location="Remote",
                    description="Internship de 3 luni în echipa de Data & Analytics. Vei învăța să lucrezi cu seturi mari de date.",
                    requirements="Python sau R, Excel avansat, statistică de bază",
                    job_type="internship"
                ),
                models.Job(
                    title="Junior Backend Developer (Java)",
                    company="Tremend",
                    location="Cluj-Napoca",
                    description="Vei face parte din echipa de backend și vei contribui la microservicii construite cu Spring Boot.",
                    requirements="Java, Spring Boot, REST, baze de date relaționale",
                    job_type="junior"
                ),
            ]
            db.add_all(joburi_test)
            db.commit()
            print("✅ Seed data adăugat: 4 joburi de test inserate în baza de date.")
        else:
            print("ℹ️  Baza de date conține deja joburi. Seed data nu a fost reinserat.")
    finally:
        db.close()

    yield

    print("🛑 Serverul s-a oprit.")


# ---------------------------------------------------------------------------
# 2. INIȚIALIZARE APLICAȚIE
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Student-Link API",
    description="Backend pentru platforma de internship-uri dedicată studenților",
    version="1.0.0",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# 3. CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ← ADĂUGAT: înregistrăm rutele de autentificare (/auth/register, /auth/login)
app.include_router(company_jobs_router)   # conține /jobs/my-jobs
app.include_router(applications_router)   # conține /jobs/applied
app.include_router(auth_router)
app.include_router(profile_router)

# ---------------------------------------------------------------------------
# 4. SCHEME PYDANTIC
# ---------------------------------------------------------------------------

class JobSchema(BaseModel):
    id: int
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    job_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# 5. RUTE API
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"mesaj": "Student-Link API funcționează!", "versiune": "1.0.0"}


@app.get("/jobs", response_model=List[JobSchema])
def get_jobs(db: Session = Depends(get_db)):
    joburi = db.query(models.Job).order_by(models.Job.created_at.desc()).all()
    return joburi


@app.get("/jobs/{job_id}", response_model=JobSchema)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job-ul nu a fost găsit")
    return job