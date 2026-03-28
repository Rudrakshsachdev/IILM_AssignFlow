"""
Pydantic schemas for Submission CRUD operations.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class SubmissionCreate(BaseModel):
    assignment_id: int
    file_url: str


class SubmissionResponse(BaseModel):
    id: str
    assignment_id: int
    student_id: int
    file_url: str
    status: str
    marks: Optional[int] = None
    feedback: Optional[str] = None
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
