# models.py - Definirea tabelelor din baza de date folosind SQLAlchemy

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """
    Tabelul 'users' - stochează atât studenții cât și companiile.
    Rolul este diferențiat prin câmpul 'role'.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)          # în MVP stocăm plain text, ulterior hash
    role = Column(String(50), nullable=False)               # "student" sau "company"
    name = Column(String(255), nullable=False)              # Nume student sau denumire companie
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Job(Base):
    """
    Tabelul 'jobs' - anunțurile de internship/job junior postate de companii.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)             # ex: "Internship Frontend Developer"
    company = Column(String(255), nullable=False)           # ex: "Bitdefender"
    location = Column(String(255), nullable=True)           # ex: "Cluj-Napoca" sau "Remote"
    description = Column(Text, nullable=True)               # descrierea detaliată a jobului
    requirements = Column(Text, nullable=True)              # cerințe: "Python, SQL, comunicare..."
    job_type = Column(String(100), nullable=True)           # "internship" sau "junior"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
