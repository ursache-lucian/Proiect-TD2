# profile.py - Endpoint-uri pentru profilul studentului

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from jose import jwt, JWTError

from database import get_db
from models import User

# Importăm configurările JWT din auth.py (să nu le duplicăm)
from auth import SECRET_KEY, ALGORITHM

# ─── Router și sistem de citire token din header ──────────────────────────────
router = APIRouter(prefix="/profile", tags=["Profil"])
security = HTTPBearer()  # Citește automat token-ul din header-ul "Authorization: Bearer ..."


# ─── Funcție utilitară: verifică tokenul și returnează userul din BD ──────────

def get_user_curent(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Verifică dacă token-ul JWT din header este valid.
    Dacă nu → aruncă eroare 401.
    Dacă da → returnează obiectul User din baza de date.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid sau expirat.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizatorul nu mai există.",
        )
    return user


# ─── Scheme Pydantic ──────────────────────────────────────────────────────────

class ProfilResponse(BaseModel):
    """Structura JSON returnată de GET /profile/me"""
    user_id: int
    name: str
    email: str
    role: str
    faculty: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[str] = None

    class Config:
        from_attributes = True


class ProfilUpdateRequest(BaseModel):
    """Structura JSON primită de PUT /profile/me"""
    faculty: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[str] = None


# ─── Endpoint: GET /profile/me ────────────────────────────────────────────────

@router.get("/me", response_model=ProfilResponse)
def get_profil(user: User = Depends(get_user_curent)):
    """
    Returnează profilul utilizatorului autentificat.
    Token-ul JWT trebuie trimis în header: Authorization: Bearer {token}
    """
    return ProfilResponse(
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        faculty=user.faculty,
        description=user.description,
        skills=user.skills,
    )


# ─── Endpoint: PUT /profile/me ────────────────────────────────────────────────

@router.put("/me")
def update_profil(
    date: ProfilUpdateRequest,
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Actualizează profilul utilizatorului autentificat.
    Doar câmpurile trimise sunt modificate (cele lipsă rămân neschimbate).
    """
    # Actualizăm doar câmpurile care au fost trimise (nu None)
    if date.faculty is not None:
        user.faculty = date.faculty
    if date.description is not None:
        user.description = date.description
    if date.skills is not None:
        user.skills = date.skills

    db.commit()
    return {"message": "Profil actualizat cu succes"}