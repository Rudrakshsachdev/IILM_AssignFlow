"""
Assignment service layer.
Business logic for assignment CRUD operations.
Faculty can only manage their own assignments.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.assignment import Assignment
from app.models.students import Student
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate
from app.services.academic_service import validate_faculty_mapping, get_subject_name, build_section_label


def create_assignment(db: Session, faculty_id: int, data: AssignmentCreate) -> Assignment:
    """Create a new assignment for a faculty member."""
    # If academic hierarchy fields are provided, validate the mapping
    if data.subject_id and data.section_id:
        if not validate_faculty_mapping(db, faculty_id, data.subject_id, data.section_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to teach this subject for this section."
            )

    new_assignment = Assignment(
        faculty_id=faculty_id,
        **data.model_dump()
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment


def get_faculty_assignments(
    db: Session,
    faculty_id: int,
    subject: str = None,
    status_filter: str = None,
    sort_by: str = "deadline",
    sort_order: str = "asc",
) -> list[Assignment]:
    """
    Get all assignments for a given faculty member.
    Supports optional filtering by subject and status, and sorting.
    """
    query = db.query(Assignment).filter(Assignment.faculty_id == faculty_id)

    if subject:
        query = query.filter(Assignment.subject.ilike(f"%{subject}%"))

    if status_filter:
        query = query.filter(Assignment.status == status_filter)

    # Sorting
    if sort_by == "deadline":
        order_col = Assignment.deadline
    elif sort_by == "created_at":
        order_col = Assignment.created_at
    elif sort_by == "title":
        order_col = Assignment.title
    else:
        order_col = Assignment.deadline

    if sort_order == "desc":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    return query.all()


def get_assignment_by_id(db: Session, assignment_id: int, faculty_id: int) -> Assignment:
    """Get a single assignment by ID, ensuring it belongs to the requesting faculty."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found."
        )

    if assignment.faculty_id != faculty_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this assignment."
        )

    return assignment


def update_assignment(db: Session, assignment_id: int, faculty_id: int, data: AssignmentUpdate) -> Assignment:
    """Update an assignment, ensuring it belongs to the requesting faculty."""
    assignment = get_assignment_by_id(db, assignment_id, faculty_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)
    return assignment


def delete_assignment(db: Session, assignment_id: int, faculty_id: int) -> None:
    """Delete an assignment, ensuring it belongs to the requesting faculty."""
    assignment = get_assignment_by_id(db, assignment_id, faculty_id)

    db.delete(assignment)
    db.commit()


def get_student_assignments(
    db: Session,
    section_id: int,
    subject: str = None,
    sort_by: str = "deadline",
    sort_order: str = "asc",
) -> list[Assignment]:
    """
    Get all published assignments visible to a student in a specific section.
    
    Strict backend filtering:
    - Only returns assignments explicitly targeted at the student's section_id.
    - If section_id is None/0 (student has no profile), returns an empty list.
    - Does NOT show un-scoped assignments (section_id == NULL) to prevent data leaks.
    """
    if not section_id:
        return []  # No profile / no section = no assignments

    query = db.query(Assignment).filter(
        Assignment.status == "published",
        Assignment.section_id == section_id,
    )

    if subject:
        query = query.filter(Assignment.subject.ilike(f"%{subject}%"))

    # Sorting
    sort_columns = {
        "deadline": Assignment.deadline,
        "created_at": Assignment.created_at,
        "title": Assignment.title,
    }
    order_col = sort_columns.get(sort_by, Assignment.deadline)

    if sort_order == "desc":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    return query.all()


def get_student_assignment_by_id(db: Session, assignment_id: int, section_id: int) -> Assignment:
    """
    Get a single published assignment by ID — with mandatory section-scoping.
    
    Security: A student can ONLY view an assignment if it belongs to their section.
    This prevents manual API access (e.g. /student/5) from leaking other sections' data.
    """
    if not section_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete your student profile to view assignments."
        )

    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.status == "published",
        Assignment.section_id == section_id,
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found, not published, or not assigned to your section."
        )

    return assignment


def enrich_assignment_response(db: Session, assignment) -> dict:
    """Add subject_name and section_label to an assignment for API responses."""
    data = {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "subject": assignment.subject,
        "deadline": assignment.deadline,
        "max_marks": assignment.max_marks,
        "faculty_id": assignment.faculty_id,
        "file_url": assignment.file_url,
        "status": assignment.status,
        "subject_id": assignment.subject_id,
        "section_id": assignment.section_id,
        "subject_name": get_subject_name(db, assignment.subject_id) if assignment.subject_id else assignment.subject,
        "section_label": build_section_label(db, assignment.section_id) if assignment.section_id else None,
        "created_at": assignment.created_at,
        "updated_at": assignment.updated_at,
    }
    return data
