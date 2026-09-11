from sqlalchemy import Column, Integer, String, Boolean

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    is_default = Column(Boolean, default=False)