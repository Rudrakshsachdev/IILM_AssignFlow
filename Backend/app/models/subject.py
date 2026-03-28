"""
Subject model for the database.
Represents a subject taught in the university (e.g., DSA, DBMS).
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from app.db.base import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # e.g. "DSA", "DBMS"
    code = Column(String, nullable=True, unique=True)  # e.g. "CS201"

    created_at = Column(DateTime, default=datetime.utcnow)
