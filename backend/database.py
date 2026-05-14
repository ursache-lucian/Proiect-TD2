# database.py - Configurarea conexiunii la baza de date SQLite

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Fișierul SQLite va fi creat automat în același folder cu acest script
DATABASE_URL = "sqlite:///./proiect.db"

# Creăm motorul SQLAlchemy care gestionează conexiunea la baza de date
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Necesar pentru SQLite cu FastAPI
)

# SessionLocal este clasa din care vom crea sesiuni de lucru cu BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base este clasa de bază pe care o vor moșteni toate modelele noastre
Base = declarative_base()


# Funcție utilă (dependency) folosită în rute pentru a obține o sesiune
def get_db():
    db = SessionLocal()
    try:
        yield db  # Dă sesiunea rutei, iar după ce ruta termină...
    finally:
        db.close()  # ...o închide automat (chiar și în caz de eroare)
