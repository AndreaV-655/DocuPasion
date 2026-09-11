"""
Servicio de configuración del sistema.

Combina los valores por defecto (variables de entorno / Settings) con los
valores persistidos en la tabla system_config. Permite al administrador
cambiar parámetros en tiempo de ejecución (RF-020) sin reiniciar el servicio.
"""

from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.system_config import SystemConfig

DEFAULT_KEYS = {
    "chunk_size": str(settings.CHUNK_SIZE),
    "chunk_overlap": str(settings.CHUNK_OVERLAP),
    "llm_model": settings.LLM_MODEL,
}


class ConfigService:
    @staticmethod
    def get(db: Session, key: str) -> Optional[str]:
        row = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if row:
            return row.value
        return DEFAULT_KEYS.get(key)

    @staticmethod
    def get_int(db: Session, key: str, default: int) -> int:
        try:
            return int(ConfigService.get(db, key) or default)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def all(db: Session) -> Dict[str, str]:
        merged = dict(DEFAULT_KEYS)
        for row in db.query(SystemConfig).all():
            merged[row.key] = row.value
        return merged

    @staticmethod
    def set(db: Session, key: str, value: str) -> None:
        row = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if row:
            row.value = value
        else:
            db.add(SystemConfig(key=key, value=value))