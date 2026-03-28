"""
Course model for the database.
Represents an academic course (e.g., B.Tech, BBA, BCA).
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # e.g. "B.Tech", "BBA"

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    sections = relationship("Section", back_populates="course")
