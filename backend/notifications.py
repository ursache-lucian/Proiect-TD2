# notifications.py - Endpoint-uri pentru sistemul de notificări

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from database import get_db
from models import Notification, User
from profile import get_user_curent

router = APIRouter(prefix="/notifications", tags=["Notificări"])


# ─── Funcție utilitară: creează o notificare (folosită din alte module) ───────

def creeaza_notificare(db: Session, user_id: int, message: str):
    """
    Creează o notificare nouă pentru un utilizator.
    Se apelează din applications.py și company_jobs.py.
    """
    notificare = Notification(
        user_id=user_id,
        message=message
    )
    db.add(notificare)
    db.commit()


# ─── Schema Pydantic ──────────────────────────────────────────────────────────

class NotificationSchema(BaseModel):
    """Structura exactă returnată în GET /notifications"""
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Endpoint: GET /notifications ────────────────────────────────────────────

@router.get("", response_model=List[NotificationSchema])
def get_notificari(
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Returnează toate notificările utilizatorului autentificat,
    ordonate de la cea mai recentă la cea mai veche.
    """
    notificari = db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(Notification.created_at.desc()).all()

    return notificari


# ─── Endpoint: PUT /notifications/{notification_id}/read ─────────────────────

@router.put("/{notification_id}/read")
def marcheaza_citita(
    notification_id: int,
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Marchează o notificare specifică ca citită.
    Verificăm că notificarea aparține userului autentificat.
    """
    notificare = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id     # securitate: nu poți citi notificările altcuiva
    ).first()

    if notificare is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificarea nu a fost găsită."
        )

    notificare.is_read = True
    db.commit()

    return {"message": "Notificare marcată ca citită."}


# ─── Endpoint: PUT /notifications/read-all ───────────────────────────────────

@router.put("/read-all")
def marcheaza_toate_citite(
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Marchează TOATE notificările utilizatorului autentificat ca citite.
    """
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).update({"is_read": True})

    db.commit()

    return {"message": "Toate notificările au fost marcate ca citite."}