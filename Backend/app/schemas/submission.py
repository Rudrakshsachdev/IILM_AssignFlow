"""
Pydantic schemas for Submission CRUD operations.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class SubmissionCreate(BaseModel):
    assignment_id: int
    file_url: str


class SubmissionEvaluateRequest(BaseModel):
    marks_obtained: Optional[int] = None
    feedback: Optional[str] = None
    status: str



class SubmissionResponse(BaseModel):
    id: str
    assignment_id: int
    student_id: int
    file_url: str
    status: str
    marks_obtained: Optional[int] = None
    feedback: Optional[str] = None
    evaluated_at: Optional[datetime] = None
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubmissionWithStudentResponse(SubmissionResponse):
    student_name: str
    student_urn: str
    student_course: str
    student_branch: str
    student_year: int
    student_sem: int
    student_section: str

    class Config:
        from_attributes = True
