"""
Pydantic schemas for Assignment CRUD operations.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AssignmentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    subject: str = Field(..., min_length=2, max_length=100)
    deadline: datetime
    max_marks: int = Field(..., ge=1, le=1000)
    file_url: Optional[str] = None
    status: Optional[str] = "published"


class AssignmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    subject: Optional[str] = Field(None, min_length=2, max_length=100)
    deadline: Optional[datetime] = None
    max_marks: Optional[int] = Field(None, ge=1, le=1000)
    file_url: Optional[str] = None
    status: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    subject: str
    deadline: datetime
    max_marks: int
    faculty_id: int
    file_url: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
