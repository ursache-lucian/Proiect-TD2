# company_jobs.py - Endpoint-uri pentru companii: postare și gestionare joburi

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Job, User
from profile import get_user_curent

from notifications import creeaza_notificare

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

# ─── Schema pentru studentul returnat în lista de aplicanți ──────────────────

class StudentAplicantSchema(BaseModel):
    """Structura exactă returnată în GET /jobs/{job_id}/applicants"""
    user_id: int
    name: str
    email: str
    faculty: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Endpoint: GET /jobs/{job_id}/applicants ─────────────────────────────────

@router.get("/jobs/{job_id}/applicants", response_model=List[StudentAplicantSchema])
def vezi_aplicanti(
    job_id: int,
    companie: User = Depends(verifica_companie),
    db: Session = Depends(get_db)
):
    """
    Returnează lista studenților care au aplicat la un job specific.
    Doar compania care a postat jobul poate vedea aplicanții.
    """
    # Verificăm că jobul există
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job-ul nu a fost găsit."
        )

    # Verificăm că jobul aparține companiei autentificate
    if job.company != companie.name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nu poți vedea aplicanții unui job care nu îți aparține."
        )

    # Luăm toate aplicările pentru acest job
    from models import Application
    aplicari = db.query(Application).filter(
        Application.job_id == job_id
    ).all()

    # Dacă nu a aplicat nimeni, returnăm listă goală
    if not aplicari:
        return []

    # Luăm userii (studenții) care au aplicat
    student_ids = [aplicare.student_id for aplicare in aplicari]
    studenti = db.query(User).filter(User.id.in_(student_ids)).all()

    #notificare vizualizare profil
    for student in studenti:
        creeaza_notificare(
            db=db,
            user_id=student.id,
            message="O companie ți-a vizualizat profilul!"
        )

    return [
        StudentAplicantSchema(...)
        for student in studenti
    ]


    # Construim răspunsul cu câmpurile cerute
    return [
        StudentAplicantSchema(
            user_id=student.id,
            name=student.name,
            email=student.email,
            faculty=student.faculty,
            description=student.description,
            skills=student.skills,
        )
        for student in studenti
    ]