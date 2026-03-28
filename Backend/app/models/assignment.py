"""
Assignment model for the database.
Represents an assignment created by a faculty member.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)  # Kept for backward compatibility
    deadline = Column(DateTime, nullable=False)
    max_marks = Column(Integer, nullable=False)

    # FK to users table (Integer to match users.id)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Academic hierarchy FKs (nullable for backward compat with old assignments)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True, index=True)

    # Cloudinary file URL (optional — assignment may not have a file)
    file_url = Column(Text, nullable=True)

    # Status: draft, published, closed
    status = Column(String, default="published")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    faculty = relationship("User")
    subject_rel = relationship("Subject")
    section_rel = relationship("Section")