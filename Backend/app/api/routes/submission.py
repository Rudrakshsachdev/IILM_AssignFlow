"""
Submission API routes for students.
Create submissions, get submissions, and upload assignment submission files.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.users import User
from app.api.deps import RoleChecker
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.submission_service import (
    submit_assignment,
    get_student_submissions,
)
from app.utils.cloudinary import upload_assignment_file

router = APIRouter()

# Only students can submit assignments
allow_student = RoleChecker(["student"])


@router.post("/", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Submit an assignment — with section-scoped access control."""
    from app.models.students import Student

    # Resolve student's section for access control
    student_profile = db.query(Student).filter(Student.user_id == current_user.id).first()
    section_id = student_profile.section_id if student_profile else None

    submission = submit_assignment(
        db=db,
        student_id=current_user.id,
        assignment_id=data.assignment_id,
        file_url=data.file_url,
        section_id=section_id
    )
    return submission


@router.get("/my", response_model=List[SubmissionResponse])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Get all submissions for the logged-in student."""
    return get_student_submissions(db=db, student_id=current_user.id)


@router.post("/upload-file")
def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(allow_student),
):
    """Upload a submission file to Cloudinary and return the URL."""
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
