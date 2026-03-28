"""
Pydantic schemas for Academic structure (Course, Section, Subject, FacultyMapping).
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CourseResponse(BaseModel):
    id: int
    name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SectionResponse(BaseModel):
    id: int
    course_id: int
    year: int
    section_name: str
    course_name: Optional[str] = None  # populated in service layer
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubjectResponse(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FacultyMappingCreate(BaseModel):
    faculty_id: int
    subject_id: int
    section_id: int


class FacultyMappingResponse(BaseModel):
    id: int
    faculty_id: int
    subject_id: int
    section_id: int
    subject_name: Optional[str] = None
    section_label: Optional[str] = None  # e.g. "B.Tech - 2nd Year - Section A"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
