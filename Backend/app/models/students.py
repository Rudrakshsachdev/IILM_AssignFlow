"""
Student model for the database.
Represents student profile data linked to a User account.
"""

from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Integer, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    # One-to-one link with users table
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    student_name = Column(String, nullable=False)
    student_email = Column(String, unique=True, nullable=True)
    student_urn = Column(String, nullable=False, unique=True, index=True)
    student_course = Column(String, nullable=False)
    student_branch = Column(String, nullable=False)
    student_year = Column(Integer, nullable=False)
    student_sem = Column(Integer, nullable=False)
    student_section = Column(String, nullable=False)  # Kept for display
    student_mobile = Column(String(15), nullable=False, unique=True)
    student_profile_pic = Column(Text, nullable=True)  # Cloudinary URL

    # Academic hierarchy FK (nullable for backward compat)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True, index=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student")
    section = relationship("Section")