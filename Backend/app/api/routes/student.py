"""
Student profile API routes.
Handles profile creation, retrieval, update, and profile picture upload.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.users import User
from app.api.deps import get_current_user, RoleChecker
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.services.student_service import (
    create_student_profile,
    get_student_profile,
    update_student_profile,
    update_profile_pic_url,
)
from app.utils.cloudinary import upload_profile_pic

router = APIRouter()

# Dependency: only students can access these routes
allow_student = RoleChecker(["student"])


@router.post("/profile", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Create a student profile for the currently authenticated student user."""
    profile = create_student_profile(db=db, user_id=current_user.id, data=data)
    return profile


@router.get("/profile", response_model=StudentResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Get the profile of the currently authenticated student."""
    profile = get_student_profile(db=db, user_id=current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please create one."
        )
    return profile


@router.put("/profile", response_model=StudentResponse)
def update_profile(
    data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Update the profile of the currently authenticated student."""
    profile = update_student_profile(db=db, user_id=current_user.id, data=data)
    return profile


@router.post("/profile/upload-pic", response_model=StudentResponse)
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    """Upload and update the student's profile picture. Requires profile to exist."""
    # Validation remains same...
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > 5 * 1024 * 1024:
         raise HTTPException(status_code=400, detail="File too large")

    try:
        url = upload_profile_pic(file.file, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    profile = update_profile_pic_url(db=db, user_id=current_user.id, url=url)
    return profile


@router.post("/profile/upload-only")
def upload_only(
    file: UploadFile = File(...),
    current_user: User = Depends(allow_student),
):
    """Upload a picture and return the URL. Does not require a profile to exist yet."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        url = upload_profile_pic(file.file, current_user.id)
        return {"student_profile_pic": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

