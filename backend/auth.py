from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from database import get_db
from models import User

# ─── Configurare JWT ──────────────────────────────────────────────────────────
# IMPORTANT: în producție, mută SECRET_KEY într-un fișier .env!
SECRET_KEY = "student-link-secret-super-greu-de-ghicit-2026"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24  # tokenul expiră după 24 de ore

# ─── Configurare bcrypt pentru hashing parole ─────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Router FastAPI ───────────────────────────────────────────────────────────
router = APIRouter(prefix="/auth", tags=["Autentificare"])


# ─── Scheme Pydantic ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str        # același câmp ca în models.py
    role: str        # "student" sau "company"


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterResponse(BaseModel):
    message: str
    user_id: int


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str        # același câmp ca în models.py
    user_id: int


# ─── Funcții utilitare ────────────────────────────────────────────────────────

def hash_parola(parola: str) -> str:
    """Transformă parola în clar într-un hash bcrypt."""
    return pwd_context.hash(parola)


def verifica_parola(parola_in_clar: str, hash_stocat: str) -> bool:
    """Verifică dacă parola introdusă corespunde hash-ului din baza de date."""
    return pwd_context.verify(parola_in_clar, hash_stocat)


def creeaza_token(data: dict) -> str:
    """Generează un JWT cu datele utilizatorului + data expirării."""
    payload = data.copy()
    expira_la = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expira_la})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ─── Endpoint: POST /auth/register ───────────────────────────────────────────

@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(date: RegisterRequest, db: Session = Depends(get_db)):
    """
    Înregistrează un utilizator nou.
    Parola este hashed înainte de salvare.
    """
    # Verificăm dacă emailul există deja
    if db.query(User).filter(User.email == date.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Există deja un cont cu acest email."
        )

    # Validăm rolul
    if date.role not in ("student", "company"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rolul trebuie să fie 'student' sau 'company'."
        )

    # Creăm userul cu parola hashed
    user_nou = User(
        email=date.email,
        password=hash_parola(date.password),
        name=date.name,       # câmpul 'name' din models.py
        role=date.role,
    )
    db.add(user_nou)
    db.commit()
    db.refresh(user_nou)

    return RegisterResponse(message="Cont creat cu succes", user_id=user_nou.id)


# ─── Endpoint: POST /auth/login ───────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
def login(date: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentifică un utilizator și returnează un JWT.
    """
    user = db.query(User).filter(User.email == date.email).first()

    # Același mesaj pentru email greșit SAU parolă greșită (securitate)
    if not user or not verifica_parola(date.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email sau parolă incorectă.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = creeaza_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
    })

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        name=user.name,       # câmpul 'name' din models.py
        user_id=user.id,
    )