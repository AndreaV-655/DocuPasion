from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey

from app.database import Base


class ErrorLog(Base):
    """Registro de errores del procesamiento o del sistema."""

    __tablename__ = "error_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True, index=True)
    error_code = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    level = Column(String(20), default="error")
    created_at = Column(DateTime, default=datetime.utcnow)