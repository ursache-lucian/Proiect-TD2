# main.py - Punctul de intrare al aplicației FastAPI (Student-Link Backend)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from contextlib import asynccontextmanager

# Importăm modulele noastre locale
from database import engine, get_db, Base
import models

# ---------------------------------------------------------------------------
# 1. LIFESPAN - Înlocuiește vechiul @app.on_event("startup") (deprecated)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Codul ÎNAINTE de 'yield' rulează la pornirea serverului.
    Codul DUPĂ 'yield' rulează la oprirea serverului.
    """
    # La pornire: creăm tabelele și inserăm seed data
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

    yield  # Serverul rulează aici

    # La oprire (opțional): putem închide conexiuni, etc.
    print("🛑 Serverul s-a oprit.")


# ---------------------------------------------------------------------------
# 2. INIȚIALIZARE APLICAȚIE (cu lifespan)
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Student-Link API",
    description="Backend pentru platforma de internship-uri dedicată studenților",
    version="1.0.0",
    lifespan=lifespan  # Legăm funcția lifespan de aplicație
)

# ---------------------------------------------------------------------------
# 2. CORS - Permite frontend-ului React (Vite pe portul 5173) să comunice cu backend-ul
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Portul implicit Vite/React
    allow_credentials=True,
    allow_methods=["*"],                        # GET, POST, PUT, DELETE etc.
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 3. SCHEME PYDANTIC - Definesc structura JSON returnată/primită de API
# ---------------------------------------------------------------------------

class JobSchema(BaseModel):
    """
    Schema pentru un job returnat de API.
    Aceasta este structura EXACTĂ a JSON-ului pe care frontend-ul o va primi.
    """
    id: int
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    job_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True  # Permite conversia din obiect SQLAlchemy în JSON


# ---------------------------------------------------------------------------
# 4. RUTE API
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    """Ruta de bază - confirmă că serverul rulează."""
    return {"mesaj": "Student-Link API funcționează!", "versiune": "1.0.0"}


@app.get("/jobs", response_model=List[JobSchema])
def get_jobs(db: Session = Depends(get_db)):
    """
    Returnează TOATE joburile disponibile din baza de date,
    ordonate de la cel mai recent la cel mai vechi.

    Răspuns JSON (listă de obiecte):
    [
        {
            "id": 1,
            "title": "Internship Frontend Developer",
            "company": "Bitdefender",
            "location": "Cluj-Napoca",
            "description": "...",
            "requirements": "React, HTML/CSS, ...",
            "job_type": "internship",
            "created_at": "2025-01-15T10:30:00"
        },
        ...
    ]
    """
    joburi = db.query(models.Job).order_by(models.Job.created_at.desc()).all()
    return joburi


@app.get("/jobs/{job_id}", response_model=JobSchema)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """
    Returnează un singur job după ID.
    Util pentru pagina de detalii a unui anunț.
    """
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job-ul nu a fost găsit")
    return job
