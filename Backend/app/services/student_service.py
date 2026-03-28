"""
Student service layer.
Business logic for student profile CRUD operations.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.students import Student
from app.schemas.student import StudentCreate, StudentUpdate


def create_student_profile(db: Session, user_id: int, data: StudentCreate) -> Student:
    """
    This function creates a new student profile in the database. It first checks if a profile already exists for the given user_id, and if so, it raises a 409 Conflict HTTP exception. It also checks for duplicate student URN and mobile number to ensure data integrity. If all checks pass, it creates a new Student instance with the provided data, adds it to the database session, commits the transaction, and refreshes the instance to return the newly created student profile.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user to whom the student profile will be linked.
    - data: A StudentCreate schema object containing the data for the new student profile.

    Returns:
    - A Student object representing the newly created student profile.

    Raises:
    - HTTPException: If a student profile already exists for the user_id, if the student URN is already in use, or if the mobile number is already registered.
    """

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
    """
    This function retrieves a student profile from the database based on the provided user_id. It queries the Student table for a profile linked to the given user_id and returns it. If no profile is found, it returns None.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user whose student profile is to be retrieved.

    Returns:
    - A Student object representing the student profile linked to the user_id, or None if no profile is found.
    """
    profile = db.query(Student).filter(Student.user_id == user_id).first()
    return profile


def update_student_profile(db: Session, user_id: int, data: StudentUpdate) -> Student:
    """
    This function updates an existing student profile in the database. It first retrieves the profile linked to the given user_id. If no profile is found, it raises a 404 Not Found HTTP exception. It then updates the profile fields with the provided data, commits the changes to the database, and refreshes the instance to return the updated student profile.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user whose student profile is to be updated.
    - data: A StudentUpdate schema object containing the fields to be updated in the student profile.

    Returns:
    - A Student object representing the updated student profile.
    """

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
    """
    This function updates the profile picture URL for a student profile.

    Arguments:
    - db: A SQLAlchemy Session object for database operations.
    - user_id: An integer representing the ID of the user whose student profile is to be updated.
    - url: A string representing the new profile picture URL.

    Returns:
    - A Student object representing the updated student profile.
    """
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
