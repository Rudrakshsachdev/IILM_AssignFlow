"""
Assignment API routes for faculty.
Full CRUD + file upload for assignments.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.session import get_db
from app.models.users import User
from app.api.deps import RoleChecker
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.services.assignment_service import (
    create_assignment,
    get_faculty_assignments,
    get_assignment_by_id,
    update_assignment,
    delete_assignment,
    get_student_assignments,
    get_student_assignment_by_id,
)
from app.utils.cloudinary import upload_assignment_file

router = APIRouter()

allow_faculty = RoleChecker(["faculty"])
allow_student = RoleChecker(["student"])


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Create a new assignment."""
    assignment = create_assignment(db=db, faculty_id=current_user.id, data=data)
    return assignment


@router.get("/", response_model=List[AssignmentResponse])
def get_all(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    sort_by: Optional[str] = Query("deadline", description="Sort by: deadline, created_at, title"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Get all assignments for the logged-in faculty, with optional filtering and sorting."""
    assignments = get_faculty_assignments(
        db=db,
        faculty_id=current_user.id,
        subject=subject,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return assignments


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_one(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Get a single assignment by ID."""
    assignment = get_assignment_by_id(db=db, assignment_id=assignment_id, faculty_id=current_user.id)
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update(
    assignment_id: int,
    data: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Update an assignment."""
    assignment = update_assignment(db=db, assignment_id=assignment_id, faculty_id=current_user.id, data=data)
    return assignment


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Delete an assignment."""
    delete_assignment(db=db, assignment_id=assignment_id, faculty_id=current_user.id)
    return None


@router.post("/upload-file")
def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(allow_faculty),
):
    """Upload an assignment file to Cloudinary and return the URL."""
    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: PDF, DOC, DOCX, JPEG, PNG."
        )

    # Check file size (10MB max for assignments)
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB allowed.")

    try:
        url = upload_assignment_file(file, current_user.id)
        return {"file_url": url, "file_name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/student/available", response_model=List[AssignmentResponse])
def get_all_student(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    sort_by: Optional[str] = Query("deadline", description="Sort by: deadline, created_at, title"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Get all published assignments globally for students."""
    assignments = get_student_assignments(
        db=db,
        subject=subject,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return assignments


@router.get("/student/{assignment_id}", response_model=AssignmentResponse)
def get_one_student(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Get a single assignment by ID globally for students."""
    assignment = get_student_assignment_by_id(db=db, assignment_id=assignment_id)
    return assignment
