from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.db.session import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.users import User
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.faculty_mapping import FacultyMapping
from app.models.allowed_users import AllowedUser
from app.schemas.users import UserOut
from app.schemas.allowed_users import AllowedUserCreate, AllowedUserUpdate, AllowedUserResponse
from app.services.allowed_users_service import add_allowed_user, update_allowed_user, delete_allowed_user, list_allowed_users, process_csv_upload

router = APIRouter()

# Restrict all routes in this router to admin role
allow_admin = RoleChecker(["admin"])

@router.get("/stats", response_model=Dict[str, int])
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin),
):
    """
    Get system statistics for the admin dashboard.
    """
    student_count = db.query(User).filter(User.role == "student").count()
    faculty_count = db.query(User).filter(User.role == "faculty").count()
    assignment_count = db.query(Assignment).count()
    course_count = db.query(Course).count()
    mapping_count = db.query(FacultyMapping).count()

    return {
        "total_students": student_count,
        "total_faculty": faculty_count,
        "total_assignments": assignment_count,
        "total_courses": course_count,
        "total_mappings": mapping_count,
    }


@router.get("/faculties", response_model=List[UserOut])
def get_all_faculties(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin),
):
    """
    Get all users with the faculty role. Basic user info only.
    """
    faculties = db.query(User).filter(User.role == "faculty").all()
    return faculties

@router.get("/allowed-users", response_model=List[AllowedUserResponse])
def get_allowed_users(db: Session = Depends(get_db), current_user: User = Depends(allow_admin)):
    """List all allowed users in the system."""
    return list_allowed_users(db)

@router.post("/allowed-users", response_model=AllowedUserResponse, status_code=201)
def create_allowed_user(data: AllowedUserCreate, db: Session = Depends(get_db), current_user: User = Depends(allow_admin)):
    """Add a new email to the allowed whitelist with a specific role."""
    return add_allowed_user(db, data)

@router.put("/allowed-users/{user_id}", response_model=AllowedUserResponse)
def modify_allowed_user(user_id: str, data: AllowedUserUpdate, db: Session = Depends(get_db), current_user: User = Depends(allow_admin)):
    """Update role or active status of a whitelisted user."""
    return update_allowed_user(db, user_id, data)

@router.delete("/allowed-users/{user_id}", status_code=204)
def remove_allowed_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(allow_admin)):
    """Remove a user from the whitelist entirely."""
    delete_allowed_user(db, user_id)
    return None

@router.post("/allowed-users/upload-csv", response_model=Dict[str, int])
async def upload_allowed_users_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(allow_admin)):
    """Upload a CSV file containing 'email' and 'role' to bulk add whitelisted users."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
        
    content = await file.read()
    try:
        decoded_content = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding issue. Please ensure the CSV is UTF-8 encoded.")
        
    result = process_csv_upload(db, decoded_content)
    return result
