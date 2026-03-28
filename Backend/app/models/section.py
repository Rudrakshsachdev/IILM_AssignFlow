"""
Section model for the database.
Represents a section within a course and year (e.g., B.Tech 2nd Year Section A).
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    year = Column(Integer, nullable=False)  # 1, 2, 3, 4
    section_name = Column(String, nullable=False)  # "A", "B", "C"

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="sections")

    __table_args__ = (
        UniqueConstraint('course_id', 'year', 'section_name', name='uq_course_year_section'),
    )
