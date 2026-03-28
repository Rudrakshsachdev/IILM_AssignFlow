from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.db.session import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.users import User
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.faculty_mapping import FacultyMapping
from app.schemas.users import UserOut

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
