"""
Academic service layer.
Business logic for courses, sections, subjects, and faculty mappings.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.course import Course
from app.models.section import Section
from app.models.subject import Subject
from app.models.faculty_mapping import FacultyMapping
from app.models.users import User


def get_all_courses(db: Session) -> List[Course]:
    """
    This function retrieves all courses from the database, ordered by their name. It returns a list of Course objects. The courses are sorted alphabetically to provide an organized view when displayed in the frontend or used in dropdowns.

    Arguments:
    db (Session): The database session used to perform the query.

    Returns:
    List[Course]: A list of Course objects representing all courses in the database, ordered by name.
    """
    return db.query(Course).order_by(Course.name).all()


def get_all_sections(db: Session, course_id: Optional[int] = None) -> List[Section]:

    """
    This function retrieves all sections from the database, optionally filtered by a specific course ID. If a course_id is provided, it returns only the sections that belong to that course. If no course_id is provided, it returns all sections. The sections are ordered by course ID, year, and section name to ensure a logical grouping and display order.

    Arguments:
    db (Session): The database session used to perform the query.
    course_id (Optional[int]): An optional integer representing the ID of the course to filter sections by. If None, all sections are returned.

    Returns:
    List[Section]: A list of Section objects representing the sections in the database, optionally filtered by course ID and ordered by course ID, year, and section name.  
    """

    query = db.query(Section)
    if course_id:
        query = query.filter(Section.course_id == course_id)
    return query.order_by(Section.course_id, Section.year, Section.section_name).all()


def get_all_subjects(db: Session) -> List[Subject]:
    """
    This function retrieves all subjects from the database, ordered by their name. It returns a list of Subject objects. The subjects are sorted alphabetically to provide an organized view when displayed in the frontend or used in dropdowns.

    Arguments:
    db (Session): The database session used to perform the query.

    Returns:
    List[Subject]: A list of Subject objects representing all subjects in the database, ordered by name.
    """
    return db.query(Subject).order_by(Subject.name).all()


def get_faculty_mappings(db: Session, faculty_id: int) -> List[dict]:
    """
    This function retrieves all faculty mappings for a specific faculty member, including display labels for the associated subjects and sections. It queries the FacultyMapping table for entries matching the given faculty_id, then enriches each mapping with the subject name and a formatted section label that includes the course name, year, and section name. The result is a list of dictionaries containing detailed information about each mapping.

    Arguments:
    db (Session): The database session used to perform the query.
    faculty_id (int): The ID of the faculty member for whom to retrieve mappings.   

    Returns:
    List[dict]: A list of dictionaries, each representing a faculty mapping with the following keys:
        - id: The ID of the faculty mapping.
        - faculty_id: The ID of the faculty member.
        - subject_id: The ID of the subject associated with the mapping.
        - section_id: The ID of the section associated with the mapping.
        - subject_name: The name of the subject associated with the mapping.
        - section_label: A formatted string representing the section, including course name, year, and section name.
        - created_at: The timestamp when the mapping was created.
    """
    mappings = db.query(FacultyMapping).filter(
        FacultyMapping.faculty_id == faculty_id
    ).all()

    result = []
    for m in mappings:
        subject = db.query(Subject).filter(Subject.id == m.subject_id).first()
        section = db.query(Section).filter(Section.id == m.section_id).first()
        course = db.query(Course).filter(Course.id == section.course_id).first() if section else None

        section_label = ""
        if section and course:
            section_label = f"{course.name} - Year {section.year} - Section {section.section_name}"

        result.append({
            "id": m.id,
            "faculty_id": m.faculty_id,
            "subject_id": m.subject_id,
            "section_id": m.section_id,
            "subject_name": subject.name if subject else "",
            "section_label": section_label,
            "created_at": m.created_at,
        })

    return result


def get_all_faculty_mappings(db: Session) -> List[dict]:

    """
    This function retrieves all faculty mappings across all faculty members, including display labels for the associated subjects and sections. It queries the FacultyMapping table for all entries, then enriches each mapping with the subject name, a formatted section label that includes the course name, year, and section name, and the faculty member's name and email. The result is a list of dictionaries containing detailed information about each mapping, which can be used for administrative purposes to view and manage faculty assignments.

    Arguments:
    db (Session): The database session used to perform the query.
    
    Returns:
    List[dict]: A list of dictionaries, each representing a faculty mapping with the following keys
    """

    """Get all subject-section mappings across all faculties. (Admin use)"""
    mappings = db.query(FacultyMapping).all()

    result = []
    for m in mappings:
        subject = db.query(Subject).filter(Subject.id == m.subject_id).first()
        section = db.query(Section).filter(Section.id == m.section_id).first()
        course = db.query(Course).filter(Course.id == section.course_id).first() if section else None
        user = db.query(User).filter(User.id == m.faculty_id).first()

        section_label = ""
        if section and course:
            section_label = f"{course.name} - Year {section.year} - Section {section.section_name}"

        result.append({
            "id": m.id,
            "faculty_id": m.faculty_id,
            "faculty_name": user.name if user else "Unknown",
            "faculty_email": user.email if user else "Unknown",
            "subject_id": m.subject_id,
            "section_id": m.section_id,
            "subject_name": subject.name if subject else "",
            "section_label": section_label,
            "created_at": m.created_at,
        })

    return result


def validate_faculty_mapping(db: Session, faculty_id: int, subject_id: int, section_id: int) -> bool:
    """Check if a faculty member is mapped to the given subject+section."""
    mapping = db.query(FacultyMapping).filter(
        FacultyMapping.faculty_id == faculty_id,
        FacultyMapping.subject_id == subject_id,
        FacultyMapping.section_id == section_id,
    ).first()
    return mapping is not None


def create_faculty_mapping(db: Session, faculty_id: int, subject_id: int, section_id: int) -> FacultyMapping:
    """Create a new faculty mapping (admin use)."""
    existing = db.query(FacultyMapping).filter(
        FacultyMapping.faculty_id == faculty_id,
        FacultyMapping.subject_id == subject_id,
        FacultyMapping.section_id == section_id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This faculty mapping already exists."
        )

    mapping = FacultyMapping(
        faculty_id=faculty_id,
        subject_id=subject_id,
        section_id=section_id,
    )
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping


def delete_faculty_mapping(db: Session, mapping_id: int) -> bool:
    """Delete a faculty mapping (admin use)."""
    mapping = db.query(FacultyMapping).filter(FacultyMapping.id == mapping_id).first()
    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty mapping not found."
        )
    db.delete(mapping)
    db.commit()
    return True


def build_section_label(db: Session, section_id: int) -> str:
    """Build a readable display label for a section."""
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        return ""
    course = db.query(Course).filter(Course.id == section.course_id).first()
    if not course:
        return f"Year {section.year} - Section {section.section_name}"
    return f"{course.name} - Year {section.year} - Section {section.section_name}"


def get_subject_name(db: Session, subject_id: int) -> str:
    """Get subject name by ID."""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    return subject.name if subject else ""


def seed_academic_data(db: Session):
    """Seed initial academic structure. Safe to call multiple times (idempotent)."""

    # Courses
    courses_data = ["B.Tech", "BBA", "BCA"]
    for name in courses_data:
        if not db.query(Course).filter(Course.name == name).first():
            db.add(Course(name=name))
    db.commit()

    # Sections for B.Tech (Years 1-4, Sections A and B)
    btech = db.query(Course).filter(Course.name == "B.Tech").first()
    if btech:
        for year in range(1, 5):
            for sec in ["A", "B"]:
                exists = db.query(Section).filter(
                    Section.course_id == btech.id,
                    Section.year == year,
                    Section.section_name == sec
                ).first()
                if not exists:
                    db.add(Section(course_id=btech.id, year=year, section_name=sec))
    db.commit()

    # Sections for BBA (Years 1-3, Section A)
    bba = db.query(Course).filter(Course.name == "BBA").first()
    if bba:
        for year in range(1, 4):
            exists = db.query(Section).filter(
                Section.course_id == bba.id,
                Section.year == year,
                Section.section_name == "A"
            ).first()
            if not exists:
                db.add(Section(course_id=bba.id, year=year, section_name="A"))
    db.commit()

    # Sections for BCA (Years 1-3, Section A)
    bca = db.query(Course).filter(Course.name == "BCA").first()
    if bca:
        for year in range(1, 4):
            exists = db.query(Section).filter(
                Section.course_id == bca.id,
                Section.year == year,
                Section.section_name == "A"
            ).first()
            if not exists:
                db.add(Section(course_id=bca.id, year=year, section_name="A"))
    db.commit()

    # Subjects
    subjects_data = [
        ("Data Structures & Algorithms", "CS201"),
        ("Database Management Systems", "CS202"),
        ("Operating Systems", "CS301"),
        ("Computer Networks", "CS302"),
        ("Software Engineering", "CS401"),
        ("Web Development", "CS203"),
        ("Artificial Intelligence", "CS402"),
        ("Machine Learning", "CS403"),
        ("Mathematics I", "MA101"),
        ("Mathematics II", "MA102"),
        ("Physics", "PH101"),
        ("Communication Skills", "HS101"),
    ]
    for name, code in subjects_data:
        if not db.query(Subject).filter(Subject.name == name).first():
            db.add(Subject(name=name, code=code))
    db.commit()

    return {"message": "Academic data seeded successfully."}
