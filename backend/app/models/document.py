from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class DocumentStatus(str, enum.Enum):
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"


def _status_values_callable(enum_cls):
    return [m.value for m in enum_cls]


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)  # en bytes
    mime_type = Column(String(100))
    status = Column(SQLEnum(DocumentStatus, values_callable=_status_values_callable),
                    default=DocumentStatus.PROCESSING)

    # Campos de IA
    content_summary = Column(Text, nullable=True)  # Resumen generado por IA
    extracted_text = Column(Text, nullable=True)  # Cache del texto extraído (opcional si usas vector DB externa)

    # Propiedad y organización
    owner_id = Column(Integer, ForeignKey("users.id"))
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    owner = relationship("User", back_populates="documents")
    repository = relationship("Repository", back_populates="documents")
    category = relationship("Category")
    extractions = relationship(
        "DocumentExtraction", backref="document", cascade="all, delete-orphan"
    )

    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)