"""
Assignment service layer.
Business logic for assignment CRUD operations.
Faculty can only manage their own assignments.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.assignment import Assignment
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate


def create_assignment(db: Session, faculty_id: int, data: AssignmentCreate) -> Assignment:
    """Create a new assignment for a faculty member."""
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
