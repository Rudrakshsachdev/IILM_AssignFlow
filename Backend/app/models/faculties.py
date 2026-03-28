"""
Faculty model for the database.
Represents faculty profile data linked to a User account.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, DateTime, Text
from app.db.base import Base
from sqlalchemy.orm import relationship


class Faculty(Base):
    __tablename__ = "faculties"

    id = Column(Integer, primary_key=True, index=True)

    # One-to-one link with users table
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    # Basic Info
    faculty_name = Column(String, nullable=False)
    faculty_employee_id = Column(String, nullable=False, unique=True, index=True)

    faculty_email = Column(String, nullable=True, unique=True)
    faculty_mobile = Column(String(15), nullable=False)

    # Academic Info
    faculty_department = Column(String, nullable=False)
    faculty_designation = Column(String, nullable=False)  # Assistant Prof, HOD, etc.
    faculty_specialization = Column(String, nullable=True)
    faculty_subjects = Column(String, nullable=True)  # Comma-separated list of subjects taught

    # Profile
    faculty_profile_pic = Column(Text, nullable=True)  # Cloudinary URL

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="faculty")