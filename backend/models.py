from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """
    Tabelul 'users' - stochează atât studenții cât și companiile.
    Rolul este diferențiat prin câmpul 'role'.
    """
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)   # stocat ca bcrypt hash, NICIODATĂ plain text
    role       = Column(String(50), nullable=False)    # "student" sau "company"
    name       = Column(String(255), nullable=False)   # Nume student sau denumire companie
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    faculty = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    cv_filename = Column(String(255), nullable=True)


class Job(Base):
    """
    Tabelul 'jobs' - anunțurile de internship/job junior postate de companii.
    """
    __tablename__ = "jobs"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(255), nullable=False)
    company      = Column(String(255), nullable=False)
    location     = Column(String(255), nullable=True)
    description  = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    job_type     = Column(String(100), nullable=True)  # "internship" sau "junior"
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    from sqlalchemy import UniqueConstraint  # ← adaugă asta sus la importuri

from sqlalchemy import UniqueConstraint  # ← adaugă asta sus la importuri

class Application(Base):
    """
    Tabelul 'applications' - legătura dintre un student și un job la care a aplicat.
    Combinația student_id + job_id este unică (nu poți aplica de două ori).
    """
    __tablename__ = "applications"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)   # id-ul userului student
    job_id     = Column(Integer, nullable=False)   # id-ul jobului
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Constrângere: un student nu poate aplica de două ori la același job
    __table_args__ = (
        UniqueConstraint("student_id", "job_id", name="uq_student_job"),
    )