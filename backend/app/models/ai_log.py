from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class AILog(Base):
    __tablename__ = "ai_logs"
    """Auditoría de consumo de tokens y rendimiento"""
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    operation_type = Column(String(30))  # 'embedding', 'summary', 'chat'
    tokens_used = Column(Integer)
    processing_time_ms = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)