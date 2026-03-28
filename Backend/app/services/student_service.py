"""
Student service layer.
Business logic for student profile CRUD operations.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.students import Student
from app.schemas.student import StudentCreate, StudentUpdate


def create_student_profile(db: Session, user_id: int, data: StudentCreate) -> Student:
    """Create a new student profile linked to the authenticated user."""

    # Check for duplicate profile
    existing = db.query(Student).filter(Student.user_id == user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student profile already exists for this user."
        )

    # Check for duplicate URN
    urn_exists = db.query(Student).filter(Student.student_urn == data.student_urn).first()
    if urn_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Student URN '{data.student_urn}' is already in use."
        )

    # Check for duplicate mobile
    mobile_exists = db.query(Student).filter(Student.student_mobile == data.student_mobile).first()
    if mobile_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This mobile number is already registered."
        )

    new_student = Student(
        user_id=user_id,
        **data.model_dump()
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


def get_student_profile(db: Session, user_id: int) -> Student:
    """Fetch a student profile by user_id. Returns None if not found."""
    profile = db.query(Student).filter(Student.user_id == user_id).first()
    return profile


def update_student_profile(db: Session, user_id: int, data: StudentUpdate) -> Student:
    """Update an existing student profile. Only updates non-None fields."""

    profile = db.query(Student).filter(Student.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found."
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


def update_profile_pic_url(db: Session, user_id: int, url: str) -> Student:
    """Update only the profile picture URL for a student profile."""
    profile = db.query(Student).filter(Student.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Create a profile first."
        )

    profile.student_profile_pic = url
    db.commit()
    db.refresh(profile)
    return profile
