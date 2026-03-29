"""
Submission model for the database.
Represents a student's submission for an assignment.
"""

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class Submission(Base):
    __tablename__ = "submissions"

    # Using string representation of UUID for broad database compatibility (SQLite/Postgres)
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    # Foreign Keys
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    file_url = Column(Text, nullable=False)
    
    status = Column(String, default="pending")
    
    # Future grading
    marks_obtained = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, nullable=True)

    submitted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignment = relationship("Assignment", backref="submissions")
    student = relationship("User", backref="submissions")

    __table_args__ = (
        UniqueConstraint('student_id', 'assignment_id', name='uq_student_assignment_submission'),
    )
