"""
Pydantic schemas for Student profile CRUD operations.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class StudentCreate(BaseModel):
    student_name: str = Field(..., min_length=2, max_length=100)
    student_urn: str = Field(..., min_length=3, max_length=30)
    student_course: str = Field(..., min_length=2, max_length=100)
    student_branch: str = Field(..., min_length=2, max_length=100)
    student_year: int = Field(..., ge=1, le=5)
    student_sem: int = Field(..., ge=1, le=10)
    student_section: str = Field(..., min_length=1, max_length=10)
    student_mobile: str = Field(..., min_length=10, max_length=15)
    student_email: Optional[str] = None
    student_profile_pic: Optional[str] = None
    section_id: Optional[int] = None


class StudentUpdate(BaseModel):
    student_name: Optional[str] = Field(None, min_length=2, max_length=100)
    student_course: Optional[str] = Field(None, min_length=2, max_length=100)
    student_branch: Optional[str] = Field(None, min_length=2, max_length=100)
    student_year: Optional[int] = Field(None, ge=1, le=5)
    student_sem: Optional[int] = Field(None, ge=1, le=10)
    student_section: Optional[str] = Field(None, min_length=1, max_length=10)
    student_mobile: Optional[str] = Field(None, min_length=10, max_length=15)
    student_email: Optional[str] = None
    student_profile_pic: Optional[str] = None
    section_id: Optional[int] = None



class StudentResponse(BaseModel):
    id: int
    user_id: int
    student_name: str
    student_email: Optional[str] = None
    student_urn: str
    student_course: str
    student_branch: str
    student_year: int
    student_sem: int
    student_section: str
    student_mobile: str
    student_profile_pic: Optional[str] = None
    section_id: Optional[int] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
