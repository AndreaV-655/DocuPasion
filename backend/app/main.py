from pathlib import Path
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.database import engine, Base, SessionLocal
from app.api import auth, documents, ai_chat, repositories, monitoring, config
from app.models.category import Category
from app.models.user import User, UserRole
from app.core.security import hash_password

logger = logging.getLogger("docupasion")


def migrate_schema() -> None:
    """Migraciones ligeras: agrega columnas nuevas a tablas existentes (SQLite y MySQL)."""
    from sqlalchemy import inspect, text
    insp = inspect(engine)
    if "ai_logs" in insp.get_table_names():
        columns = {c["name"] for c in insp.get_columns("ai_logs")}
        if "owner_id" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE ai_logs ADD COLUMN owner_id INTEGER"))

# Crear tablas (migraciones simples; en producción usar Alembic)
migrate_schema()
Base.metadata.create_all(bind=engine)


def seed_categories() -> None:
    """Siembra el catálogo de categorías con la categoría por defecto (9.12)."""
    db = SessionLocal()
    try:
        existing = {c.name for c in db.query(Category).all()}
        seeds = [
            ("académico", "Documentos de carácter académico e investigativo", False),
            ("técnico", "Documentos técnicos y de ingeniería", False),
            ("legal", "Documentos con valor legal o contractual", False),
            ("administrativo", "Documentos de gestión y administración", False),
            ("general", "Categoría por defecto cuando no se supera el umbral", True),
        ]
        for name, description, is_default in seeds:
            if name not in existing:
                db.add(Category(name=name, description=description, is_default=is_default))
        db.commit()
    finally:
        db.close()


seed_categories()


def seed_admin() -> None:
    """Crea el usuario administrador inicial si no existe."""
    db = SessionLocal()
    try:
        admin_email = "admin@docupasion.com"
        admin_pass = "Admin123456!"
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            db.add(User(
                email=admin_email,
                hashed_password=hash_password(admin_pass),
                role=UserRole.ADMIN,
            ))
            db.commit()
    finally:
        db.close()


seed_admin()

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)

origins = settings.cors_origins_list or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(ai_chat.router)
app.include_router(repositories.router)
app.include_router(monitoring.router)
app.include_router(config.router)


@app.get("/api/health")
def health():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/api/health/db")
def health_db():
    dialect = engine.dialect.name
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": dialect}
    except Exception as exc:
        return {"status": "error", "database": dialect, "detail": f"{type(exc).__name__}: {exc}"}


# Devuelve el error REAL en JSON en vez del "500 Internal Server Error" genérico,
# para que la interfaz muestre la causa exacta y no solo "Error del servidor".
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Error no controlado en %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
    )


# Frontend SPA (debe montarse al final para no ocultar las rutas /api y /docs).
# La ruta se resuelve respecto al propio paquete para no depender del CWD.
frontend_dir = Path(settings.FRONTEND_DIR)
if not frontend_dir.is_absolute():
    frontend_dir = (Path(__file__).resolve().parents[1] / settings.FRONTEND_DIR).resolve()
else:
    frontend_dir = frontend_dir.resolve()
app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")