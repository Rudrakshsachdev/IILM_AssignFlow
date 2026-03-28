"""
Faculty service layer.
Business logic for faculty profile CRUD operations.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.faculties import Faculty
from app.schemas.faculty import FacultyCreate, FacultyUpdate


def create_faculty_profile(db: Session, user_id: int, data: FacultyCreate) -> Faculty:
    """
    Create a new faculty profile in the database.
    Checks for duplicate profile, employee ID, and email before creation.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user to whom the faculty profile will be linked.
    - data: A FacultyCreate schema object containing the data for the new faculty profile.

    Returns:
    - A Faculty object representing the newly created faculty profile.

    Raises:
    - HTTPException: If a faculty profile already exists, if the employee ID is in use,
      or if the email is already registered.
    """

    # Check for duplicate profile
    existing = db.query(Faculty).filter(Faculty.user_id == user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Faculty profile already exists for this user."
        )

    # Check for duplicate employee ID
    emp_id_exists = db.query(Faculty).filter(
        Faculty.faculty_employee_id == data.faculty_employee_id
    ).first()
    if emp_id_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee ID '{data.faculty_employee_id}' is already in use."
        )

    # Check for duplicate email if provided
    if data.faculty_email:
        email_exists = db.query(Faculty).filter(
            Faculty.faculty_email == data.faculty_email
        ).first()
        if email_exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already registered to another faculty member."
            )

    new_faculty = Faculty(
        user_id=user_id,
        **data.model_dump()
    )
    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)
    return new_faculty


def get_faculty_profile(db: Session, user_id: int) -> Faculty:
    """
    Retrieve a faculty profile from the database based on the provided user_id.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user whose faculty profile is to be retrieved.

    Returns:
    - A Faculty object representing the faculty profile, or None if no profile is found.
    """
    profile = db.query(Faculty).filter(Faculty.user_id == user_id).first()
    return profile


def update_faculty_profile(db: Session, user_id: int, data: FacultyUpdate) -> Faculty:
    """
    Update an existing faculty profile in the database.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user whose faculty profile is to be updated.
    - data: A FacultyUpdate schema object containing the fields to be updated.

    Returns:
    - A Faculty object representing the updated faculty profile.

    Raises:
    - HTTPException: If the faculty profile is not found.
    """

    profile = db.query(Faculty).filter(Faculty.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty profile not found."
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


def update_profile_pic_url(db: Session, user_id: int, url: str) -> Faculty:
    """
    Update the profile picture URL for a faculty profile.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user whose faculty profile is to be updated.
    - url: A string representing the new profile picture URL.

    Returns:
    - A Faculty object representing the updated faculty profile.
    """
    profile = db.query(Faculty).filter(Faculty.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty profile not found. Create a profile first."
        )

    profile.faculty_profile_pic = url
    db.commit()
    db.refresh(profile)
    return profile
