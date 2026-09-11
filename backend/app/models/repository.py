from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Repository(Base):
    __tablename__ = "repositories"
    __table_args__ = (UniqueConstraint("owner_id", "name", name="uq_repository_owner_name"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="repositories")
    documents = relationship("Document", back_populates="repository")