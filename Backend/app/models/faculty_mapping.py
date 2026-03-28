"""
FacultyMapping model for the database.
Maps which faculty teaches which subject to which section.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class FacultyMapping(Base):
    __tablename__ = "faculty_mappings"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    faculty = relationship("User")
    subject = relationship("Subject")
    section = relationship("Section")

    __table_args__ = (
        UniqueConstraint('faculty_id', 'subject_id', 'section_id', name='uq_faculty_subject_section'),
    )
