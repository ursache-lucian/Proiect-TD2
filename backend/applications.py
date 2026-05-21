# applications.py - Endpoint-uri pentru sistemul de aplicare la joburi

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import Application, Job
from profile import get_user_curent  # reutilizăm funcția de verificare token
from models import User

from notifications import creeaza_notificare

router = APIRouter(tags=["Aplicări"])


# ─── Schema Pydantic pentru jobul returnat în lista de aplicări ───────────────

class JobAplicatSchema(BaseModel):
    """Structura exactă returnată în GET /jobs/applied"""
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


# ─── Endpoint: POST /jobs/{job_id}/apply ─────────────────────────────────────

@router.post("/jobs/{job_id}/apply")
def aplica_la_job(
    job_id: int,
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Studentul autentificat aplică la jobul cu job_id din URL.
    Nu primește nimic în body.
    """
    # Verificăm că jobul există
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job-ul nu a fost găsit."
        )

    # Verificăm dacă studentul a aplicat deja
    aplicare_existenta = db.query(Application).filter(
        Application.student_id == user.id,
        Application.job_id == job_id
    ).first()

    if aplicare_existenta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ai aplicat deja la acest job."
        )

    # Salvăm aplicarea în baza de date
    aplicare_noua = Application(
        student_id=user.id,
        job_id=job_id
    )
    db.add(aplicare_noua)
    db.commit()
    from models import User as UserModel
    companie = db.query(UserModel).filter(
        UserModel.name == job.company,
        UserModel.role == "company"
    ).first()

    if companie:
        creeaza_notificare(
            db=db,
            user_id=companie.id,
            message=f"Un student nou a aplicat la jobul tău: {job.title}!"
        )

    return {"message": "Ai aplicat cu succes!"}

    return {"message": "Ai aplicat cu succes!"}


# ─── Endpoint: GET /jobs/applied ─────────────────────────────────────────────

@router.get("/jobs/applied", response_model=List[JobAplicatSchema])
def joburi_aplicate(
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Returnează lista joburilor la care a aplicat studentul autentificat.
    """
    # Găsim toate aplicările studentului și luăm joburile asociate
    aplicari = db.query(Application).filter(
        Application.student_id == user.id
    ).all()

    job_ids = [aplicare.job_id for aplicare in aplicari]

    joburi = db.query(Job).filter(Job.id.in_(job_ids)).all()

    return joburi