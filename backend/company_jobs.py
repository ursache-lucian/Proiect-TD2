# company_jobs.py - Endpoint-uri pentru companii: postare și gestionare joburi

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Job, User
from profile import get_user_curent

router = APIRouter(tags=["Joburi Companie"])


# ─── Funcție utilitară: verifică că userul e companie ────────────────────────

def verifica_companie(user: User = Depends(get_user_curent)) -> User:
    """
    Verifică că userul autentificat are rolul 'company'.
    Dacă nu → returnează 403 Forbidden.
    """
    if user.role != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doar companiile pot accesa acest endpoint."
        )
    return user


# ─── Scheme Pydantic ──────────────────────────────────────────────────────────

class JobCreateRequest(BaseModel):
    """Ce primește backend-ul de la frontend la postarea unui job."""
    title: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    job_type: Optional[str] = None  # "internship" sau "junior"


class JobResponse(BaseModel):
    """Ce returnează backend-ul după creare sau în liste."""
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


# ─── Endpoint: POST /jobs ─────────────────────────────────────────────────────

@router.post("/jobs", response_model=JobResponse, status_code=201)
def posteaza_job(
    date: JobCreateRequest,
    companie: User = Depends(verifica_companie),
    db: Session = Depends(get_db)
):
    """
    Compania autentificată postează un job nou.
    Câmpul 'company' se ia automat din contul companiei logată.
    """
    job_nou = Job(
        title=date.title,
        company=companie.name,  # ← automat din contul companiei, nu din frontend
        location=date.location,
        description=date.description,
        requirements=date.requirements,
        job_type=date.job_type,
    )
    db.add(job_nou)
    db.commit()
    db.refresh(job_nou)

    return job_nou


# ─── Endpoint: GET /jobs/my-jobs ─────────────────────────────────────────────

@router.get("/jobs/my-jobs", response_model=List[JobResponse])
def joburile_mele(
    companie: User = Depends(verifica_companie),
    db: Session = Depends(get_db)
):
    """
    Returnează toate joburile postate de compania autentificată.
    """
    joburi = db.query(Job).filter(
        Job.company == companie.name
    ).order_by(Job.created_at.desc()).all()

    return joburi


# ─── Endpoint: DELETE /jobs/{job_id} ─────────────────────────────────────────

@router.delete("/jobs/{job_id}")
def sterge_job(
    job_id: int,
    companie: User = Depends(verifica_companie),
    db: Session = Depends(get_db)
):
    """
    Șterge un job după ID.
    Dacă jobul nu aparține companiei autentificate → 403 Forbidden.
    """
    job = db.query(Job).filter(Job.id == job_id).first()

    # Verificăm că jobul există
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job-ul nu a fost găsit."
        )

    # Verificăm că jobul aparține acestei companii
    if job.company != companie.name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nu poți șterge un job care nu îți aparține."
        )

    db.delete(job)
    db.commit()

    return {"message": "Job șters cu succes"}