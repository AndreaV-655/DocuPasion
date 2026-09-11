from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey

from app.database import Base


class DocumentExtraction(Base):
    """Campos de información relevante extraídos de un documento por tipo."""

    __tablename__ = "document_extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    field_name = Column(String(80), nullable=False)
    field_value = Column(Text, nullable=False)
    extraction_type = Column(String(30), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)