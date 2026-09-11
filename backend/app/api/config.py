from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.config import settings
from app.database import get_db
from app.models.user import User
from app.services.config_service import ConfigService

router = APIRouter(prefix="/api/config", tags=["config"])


class ConfigUpdate(BaseModel):
    llm_model: str = Field(default="gpt-4o-mini", max_length=120)
    chunk_size: int = Field(default=512, ge=1, le=8192)
    chunk_overlap: int = Field(default=64, ge=0, le=1024)


def _public_config(db: Session) -> dict:
    values = ConfigService.all(db)
    return {
        "llm_model": values.get("llm_model", settings.LLM_MODEL),
        "chunk_size": int(values.get("chunk_size", settings.CHUNK_SIZE)),
        "chunk_overlap": int(values.get("chunk_overlap", settings.CHUNK_OVERLAP)),
        "openai_configured": bool(settings.OPENAI_API_KEY),
    }


@router.get("/")
def get_config(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Nunca se devuelven secretos (RNF-003, RNF-012)."""
    return _public_config(db)


@router.put("/")
def update_config(
    payload: ConfigUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if payload.chunk_overlap >= payload.chunk_size:
        raise HTTPException(
            status_code=400,
            detail="El solapamiento debe ser menor que el tamaño del chunk",
        )
    ConfigService.set(db, "llm_model", payload.llm_model.strip())
    ConfigService.set(db, "chunk_size", str(payload.chunk_size))
    ConfigService.set(db, "chunk_overlap", str(payload.chunk_overlap))
    db.commit()
    return _public_config(db)