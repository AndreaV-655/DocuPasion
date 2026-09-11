from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    CLIENT = "client"
    ADMIN = "admin"


def _role_values_callable(enum_cls):
    return [m.value for m in enum_cls]


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole, values_callable=_role_values_callable), default=UserRole.CLIENT)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="owner")
    repositories = relationship("Repository", back_populates="owner",
                                cascade="all, delete-orphan")