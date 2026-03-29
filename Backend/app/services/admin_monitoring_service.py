from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.models.submission import Submission
from app.models.assignment import Assignment
from app.models.students import Student
from app.models.faculties import Faculty
from app.models.users import User
from app.schemas.admin_monitoring import AdminSubmissionResponse, AdminAssignmentResponse

def get_all_submissions(
    db: Session,
    year: Optional[int] = None,
    course: Optional[str] = None,
    section: Optional[str] = None,
    subject: Optional[str] = None,
) -> List[AdminSubmissionResponse]:
    """Admin function to get all submissions with advanced filtering."""
    
    query = db.query(Submission, Student, Assignment).join(
        Assignment, Submission.assignment_id == Assignment.id
    ).outerjoin(
        Student, Submission.student_id == Student.user_id
    )

    # Apply filters dynamically
    if year is not None:
        query = query.filter(Student.student_year == year)
    if course:
        query = query.filter(Student.student_course.ilike(f"%{course}%"))
    if section:
        query = query.filter(Student.student_section.ilike(f"%{section}%"))
    if subject:
        query = query.filter(Assignment.subject.ilike(f"%{subject}%"))
        
    # Order by newest
    query = query.order_by(Submission.submitted_at.desc())
    
    results = query.all()
    
    formatted_results = []
    for sub, std, assg in results:
        formatted_results.append(AdminSubmissionResponse(
            submission_id=sub.id,
            file_url=sub.file_url,
            status=sub.status,
            submitted_at=sub.submitted_at,
            student_name=std.student_name if std else "Unknown",
            student_urn=std.student_urn if std else "N/A",
            student_course=std.student_course if std else "N/A",
            student_section=std.student_section if std else "N/A",
            student_year=std.student_year if std else None,
            assignment_id=assg.id,
            assignment_title=assg.title,
            assignment_subject=assg.subject
        ))
        
    return formatted_results


def get_all_assignments(
    db: Session,
    faculty_name: Optional[str] = None,
    department: Optional[str] = None,
    subject: Optional[str] = None,
    section: Optional[str] = None,
    status: Optional[str] = None,
) -> List[AdminAssignmentResponse]:
    """Admin function to get all assignments with advanced filtering."""
    
    query = db.query(Assignment, Faculty).outerjoin(
        Faculty, Assignment.faculty_id == Faculty.user_id
    )

    if faculty_name:
        query = query.filter(Faculty.faculty_name.ilike(f"%{faculty_name}%"))
    if department:
        query = query.filter(Faculty.faculty_department.ilike(f"%{department}%"))
    if subject:
        query = query.filter(Assignment.subject.ilike(f"%{subject}%"))
    if section:
        # Note: Section string matching might need adjusting depending on how you store it
        pass # In existing assignments, section is an ID. Advanced join needed if strict string match
    if status:
        query = query.filter(Assignment.status == status)

    # Order by newest
    query = query.order_by(Assignment.created_at.desc())
    
    results = query.all()
    
    formatted_results = []
    for assg, fac in results:
        formatted_results.append(AdminAssignmentResponse(
            assignment_id=assg.id,
            title=assg.title,
            description=assg.description,
            subject=assg.subject,
            deadline=assg.deadline,
            max_marks=assg.max_marks,
            file_url=assg.file_url,
            status=assg.status,
            created_at=assg.created_at,
            faculty_name=fac.faculty_name if fac else "Unknown",
            faculty_employee_id=fac.faculty_employee_id if fac else "N/A",
            faculty_department=fac.faculty_department if fac else "N/A",
            faculty_designation=fac.faculty_designation if fac else "N/A",
        ))
        
    return formatted_results
