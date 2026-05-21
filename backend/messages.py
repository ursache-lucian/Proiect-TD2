# messages.py - Sistem de mesaje directe între useri

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Message, User
from profile import get_user_curent

router = APIRouter(prefix="/messages", tags=["Mesaje"])


# ─── Scheme Pydantic ──────────────────────────────────────────────────────────

class TrimitemesajRequest(BaseModel):
    """Ce primește backend-ul când se trimite un mesaj."""
    receiver_id: int
    content: str


class MesajSchema(BaseModel):
    """Structura unui mesaj individual."""
    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversatieSchema(BaseModel):
    """Structura unei conversații în lista de conversații."""
    user_id: int
    name: str
    role: str
    last_message: str
    created_at: datetime
    unread_count: int


# ─── Endpoint: POST /messages ─────────────────────────────────────────────────

@router.post("", response_model=MesajSchema, status_code=201)
def trimite_mesaj(
    date: TrimitemesajRequest,
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Trimite un mesaj direct către un alt utilizator.
    """
    # Verificăm că destinatarul există
    destinatar = db.query(User).filter(User.id == date.receiver_id).first()
    if destinatar is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destinatarul nu a fost găsit."
        )

    # Nu poți trimite mesaj ție însuți
    if date.receiver_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nu poți trimite mesaj ție însuți."
        )

    # Salvăm mesajul în baza de date
    mesaj_nou = Message(
        sender_id=user.id,
        receiver_id=date.receiver_id,
        content=date.content
    )
    db.add(mesaj_nou)
    db.commit()
    db.refresh(mesaj_nou)

    return mesaj_nou


# ─── Endpoint: GET /messages ──────────────────────────────────────────────────

@router.get("", response_model=List[ConversatieSchema])
def get_conversatii(
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Returnează lista conversațiilor userului autentificat,
    grupate după interlocutor, cu ultimul mesaj și numărul de necitite.
    """
    # Găsim toți userii cu care am avut conversații
    mesaje = db.query(Message).filter(
        or_(
            Message.sender_id == user.id,
            Message.receiver_id == user.id
        )
    ).order_by(Message.created_at.desc()).all()

    # Construim lista de conversații unice după interlocutor
    conversatii_dict = {}
    for mesaj in mesaje:
        # Interlocutorul e celălalt user din conversație
        interlocutor_id = mesaj.receiver_id if mesaj.sender_id == user.id else mesaj.sender_id

        if interlocutor_id not in conversatii_dict:
            interlocutor = db.query(User).filter(User.id == interlocutor_id).first()
            if interlocutor is None:
                continue

            # Numărul de mesaje necitite primite de la acest interlocutor
            unread_count = db.query(Message).filter(
                Message.sender_id == interlocutor_id,
                Message.receiver_id == user.id,
                Message.is_read == False
            ).count()

            conversatii_dict[interlocutor_id] = ConversatieSchema(
                user_id=interlocutor_id,
                name=interlocutor.name,
                role=interlocutor.role,
                last_message=mesaj.content,
                created_at=mesaj.created_at,
                unread_count=unread_count
            )

    return list(conversatii_dict.values())


# ─── Endpoint: GET /messages/{user_id} ───────────────────────────────────────

@router.get("/{user_id}", response_model=List[MesajSchema])
def get_conversatie(
    user_id: int,
    user: User = Depends(get_user_curent),
    db: Session = Depends(get_db)
):
    """
    Returnează toate mesajele dintre userul logat și userul cu user_id,
    ordonate cronologic. Marchează automat mesajele primite ca citite.
    """
    # Verificăm că interlocutorul există
    interlocutor = db.query(User).filter(User.id == user_id).first()
    if interlocutor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilizatorul nu a fost găsit."
        )

    # Luăm toate mesajele dintre cei doi useri în ambele direcții
    mesaje = db.query(Message).filter(
        or_(
            and_(Message.sender_id == user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    # Marcăm ca citite mesajele primite de userul curent
    db.query(Message).filter(
        Message.sender_id == user_id,
        Message.receiver_id == user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    return mesaje