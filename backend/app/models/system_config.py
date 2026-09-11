from sqlalchemy import Column, String, Text

from app.database import Base


class SystemConfig(Base):
    """Parámetros del sistema persistidos por llave-valor."""

    __tablename__ = "system_config"

    key = Column(String(80), primary_key=True)
    value = Column(Text, nullable=True)