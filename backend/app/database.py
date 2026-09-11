import logging

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger("docupasion")


def _mysql_reachable(url: str, timeout: int = 3) -> bool:
    try:
        eng = create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": timeout},
        )
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        eng.dispose()
        return True
    except Exception:
        return False


def _ensure_mysql_database(url: str) -> None:
    """Si la BD MySQL no existe, la crea automáticamente (solo el esquema)."""
    try:
        parsed = make_url(url)
        dbname = parsed.database
        if not dbname:
            return
        server_url = parsed.set(database=None)
        eng = create_engine(
            server_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3},
        )
        with eng.begin() as conn:
            conn.execute(text(
                f"CREATE DATABASE IF NOT EXISTS `{dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            ))
        eng.dispose()
    except Exception:
        # Si el usuario/clave no tienen permisos, se reportará al crear las tablas.
        pass


_config_url = settings.DATABASE_URL
_uses_net = _config_url.startswith(("mysql", "postgres"))

if _uses_net:
    _ensure_mysql_database(_config_url)
    if not _mysql_reachable(_config_url):
        fallback = "sqlite:///./docupasion.db"
        print("=" * 66)
        print("AVISO: MySQL no esta disponible (XAMPP apagado o credenciales")
        print("incorrectas en backend/.env).")
        print(f"Usando SQLite local en su lugar: {fallback}")
        print("La app funciona igual. Para usar MySQL enciende XAMPP.")
        print("=" * 66)
        _config_url = fallback

_is_sqlite = _config_url.startswith("sqlite")

engine = create_engine(
    _config_url,
    connect_args={"check_same_thread": False} if _is_sqlite else {"connect_timeout": 3},
    pool_pre_ping=True,
)

if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()