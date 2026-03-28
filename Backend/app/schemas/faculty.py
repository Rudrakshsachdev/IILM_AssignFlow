"""
Pydantic schemas for Faculty profile CRUD operations.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FacultyCreate(BaseModel):
    faculty_name: str = Field(..., min_length=2, max_length=100)
    faculty_employee_id: str = Field(..., min_length=3, max_length=30)
    faculty_email: Optional[str] = None
    faculty_mobile: str = Field(..., min_length=10, max_length=15)
    faculty_department: str = Field(..., min_length=2, max_length=100)
    faculty_designation: str = Field(..., min_length=2, max_length=100)
    faculty_specialization: Optional[str] = Field(None, max_length=200)
    faculty_subjects: Optional[str] = Field(None, max_length=500)
    faculty_profile_pic: Optional[str] = None


class FacultyUpdate(BaseModel):
    faculty_name: Optional[str] = Field(None, min_length=2, max_length=100)
    faculty_email: Optional[str] = None
    faculty_mobile: Optional[str] = Field(None, min_length=10, max_length=15)
    faculty_department: Optional[str] = Field(None, min_length=2, max_length=100)
    faculty_designation: Optional[str] = Field(None, min_length=2, max_length=100)
    faculty_specialization: Optional[str] = Field(None, max_length=200)
    faculty_subjects: Optional[str] = Field(None, max_length=500)
    faculty_profile_pic: Optional[str] = None


class FacultyResponse(BaseModel):
    id: int
    user_id: int
    faculty_name: str
    faculty_employee_id: str
    faculty_email: Optional[str] = None
    faculty_mobile: str
    faculty_department: str
    faculty_designation: str
    faculty_specialization: Optional[str] = None
    faculty_subjects: Optional[str] = None
    faculty_profile_pic: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
