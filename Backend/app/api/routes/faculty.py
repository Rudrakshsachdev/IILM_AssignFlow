"""
Faculty profile API routes.
Handles profile creation, retrieval, update, and profile picture upload.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.users import User
from app.api.deps import get_current_user, RoleChecker
from app.schemas.faculty import FacultyCreate, FacultyUpdate, FacultyResponse
from app.services.faculty_service import (
    create_faculty_profile,
    get_faculty_profile,
    update_faculty_profile,
    update_profile_pic_url,
)
from app.services.submission_service import evaluate_submission
from app.schemas.submission import SubmissionResponse, SubmissionEvaluateRequest
from app.utils.cloudinary import upload_profile_pic

router = APIRouter()

# Dependency: only faculty can access these routes
allow_faculty = RoleChecker(["faculty"])


@router.post("/profile", response_model=FacultyResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    data: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Create a faculty profile for the currently authenticated faculty user."""
    profile = create_faculty_profile(db=db, user_id=current_user.id, data=data)
    return profile


@router.get("/profile", response_model=FacultyResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Get the profile of the currently authenticated faculty member."""
    profile = get_faculty_profile(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty profile not found. Please create one."
        )
    return profile


@router.put("/profile", response_model=FacultyResponse)
def update_profile(
    data: FacultyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Update the profile of the currently authenticated faculty member."""
    profile = update_faculty_profile(db=db, user_id=current_user.id, data=data)
    return profile


@router.post("/profile/upload-pic", response_model=FacultyResponse)
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Upload and update the faculty member's profile picture. Requires profile to exist."""
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5MB allowed.")

    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")

    try:
        url = upload_profile_pic(file.file, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    profile = update_profile_pic_url(db=db, user_id=current_user.id, url=url)
    return profile


@router.post("/profile/upload-only")
def upload_only(
    file: UploadFile = File(...),
    current_user: User = Depends(allow_faculty),
):
    """Upload a picture and return the URL. Does not require a profile to exist yet."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")

    try:
        url = upload_profile_pic(file.file, current_user.id)
        return {"faculty_profile_pic": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/submissions/{submission_id}/evaluate", response_model=SubmissionResponse)
def evaluate_student_submission(
    submission_id: str,
    data: SubmissionEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Evaluate a student's submission by providing marks, feedback, and status."""
    return evaluate_submission(
        db=db,
        submission_id=submission_id,
        faculty_id=current_user.id,
        data=data
    )
