from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdminSubmissionResponse(BaseModel):
    submission_id: str
    file_url: str
    status: str
    submitted_at: datetime
    
    # Student Details
    student_name: Optional[str] = "Unknown"
    student_urn: Optional[str] = "N/A"
    student_course: Optional[str] = "N/A"
    student_section: Optional[str] = "N/A"
    student_year: Optional[int] = None
    
    # Assignment Details
    assignment_id: int
    assignment_title: str
    assignment_subject: str

    class Config:
        from_attributes = True


class AdminAssignmentResponse(BaseModel):
    assignment_id: int
    title: str
    description: Optional[str] = None
    subject: str
    deadline: datetime
    max_marks: int
    file_url: Optional[str] = None
    status: str
    created_at: datetime
    
    # Faculty Details
    faculty_name: Optional[str] = "Unknown"
    faculty_employee_id: Optional[str] = "N/A"
    faculty_department: Optional[str] = "N/A"
    faculty_designation: Optional[str] = "N/A"
    
    class Config:
        from_attributes = True
