"""
Academic API routes.
Handles courses, sections, subjects, and faculty mappings.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.session import get_db
from app.models.users import User
from app.api.deps import RoleChecker
from app.schemas.academic import (
    CourseResponse,
    SectionResponse,
    SubjectResponse,
    FacultyMappingResponse,
    FacultyMappingCreate,
)
from app.services.academic_service import (
    get_all_courses,
    get_all_sections,
    get_all_subjects,
    get_faculty_mappings,
    create_faculty_mapping,
    seed_academic_data,
    build_section_label,
)
from app.models.section import Section
from app.models.course import Course

router = APIRouter()

allow_faculty = RoleChecker(["faculty"])
allow_student = RoleChecker(["student"])
allow_admin = RoleChecker(["admin"])
allow_any_authenticated = RoleChecker(["student", "faculty", "admin"])


@router.get("/courses", response_model=List[CourseResponse])
def list_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_any_authenticated),
):
    """List all courses."""
    return get_all_courses(db)


@router.get("/sections")
def list_sections(
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_any_authenticated),
):
    """List all sections, optionally filtered by course."""
    sections = get_all_sections(db, course_id=course_id)
    result = []
    for s in sections:
        course = db.query(Course).filter(Course.id == s.course_id).first()
        result.append({
            "id": s.id,
            "course_id": s.course_id,
            "year": s.year,
            "section_name": s.section_name,
            "course_name": course.name if course else "",
            "created_at": s.created_at,
        })
    return result


@router.get("/subjects", response_model=List[SubjectResponse])
def list_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_any_authenticated),
):
    """List all subjects."""
    return get_all_subjects(db)


@router.get("/faculty-mappings")
def get_my_mappings(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_faculty),
):
    """Get the subject-section mappings for the logged-in faculty."""
    return get_faculty_mappings(db, faculty_id=current_user.id)


@router.post("/faculty-mappings", status_code=status.HTTP_201_CREATED)
def create_mapping(
    data: FacultyMappingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin),
):
    """Create a faculty mapping (admin only)."""
    mapping = create_faculty_mapping(
        db,
        faculty_id=data.faculty_id,
        subject_id=data.subject_id,
        section_id=data.section_id,
    )
    return {
        "id": mapping.id,
        "faculty_id": mapping.faculty_id,
        "subject_id": mapping.subject_id,
        "section_id": mapping.section_id,
        "created_at": mapping.created_at,
    }


@router.post("/seed")
def seed_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin),
):
    """Seed academic data (admin only). Idempotent."""
    return seed_academic_data(db)
