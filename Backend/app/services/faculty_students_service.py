"""
Faculty Students Service.
Provides section-scoped student access for faculty members.
Access control is enforced here — faculty can only see students
in sections they are mapped to via FacultyMapping.
"""

from sqlalchemy.orm import Session
from sqlalchemy import distinct
from collections import defaultdict
from typing import List

from app.models.faculty_mapping import FacultyMapping
from app.models.students import Student
from app.models.section import Section
from app.models.course import Course


def get_faculty_students(db: Session, faculty_id: int) -> dict:
    """
    Returns students grouped by year and section, scoped to
    sections the faculty is mapped to.

    Response shape:
    {
        "groups": [
            {
                "year": 1,
                "sections": [
                    {
                        "section_name": "A",
                        "section_id": 3,
                        "course_name": "B.Tech",
                        "count": 12,
                        "students": [ {...}, {...} ]
                    }
                ]
            }
        ],
        "total_students": 45,
        "total_sections": 4
    }
    """
    # 1. Get the distinct section_ids this faculty is mapped to
    mapped_section_ids = (
        db.query(distinct(FacultyMapping.section_id))
        .filter(FacultyMapping.faculty_id == faculty_id)
        .all()
    )
    section_ids = [row[0] for row in mapped_section_ids]

    if not section_ids:
        return {"groups": [], "total_students": 0, "total_sections": 0}

    # 2. Query students in those sections, joining Section + Course for metadata
    results = (
        db.query(Student, Section, Course)
        .join(Section, Student.section_id == Section.id)
        .join(Course, Section.course_id == Course.id)
        .filter(Student.section_id.in_(section_ids))
        .filter(Student.is_active == True)
        .order_by(Section.year, Section.section_name, Student.student_name)
        .all()
    )

    # 3. Group by year → section
    year_map = defaultdict(lambda: defaultdict(lambda: {
        "section_name": "",
        "section_id": None,
        "course_name": "",
        "students": []
    }))

    for student, section, course in results:
        key = (section.year, section.section_name)
        bucket = year_map[section.year][section.section_name]
        bucket["section_name"] = section.section_name
        bucket["section_id"] = section.id
        bucket["course_name"] = course.name

        bucket["students"].append({
            "id": student.id,
            "student_name": student.student_name,
            "student_urn": student.student_urn,
            "student_course": student.student_course,
            "student_branch": student.student_branch,
            "student_year": student.student_year,
            "student_sem": student.student_sem,
            "student_section": student.student_section,
            "student_mobile": student.student_mobile,
            "student_profile_pic": student.student_profile_pic,
        })

    # 4. Build structured response
    groups = []
    total_students = 0
    total_sections = 0

    for year in sorted(year_map.keys()):
        year_group = {"year": year, "sections": []}
        for sec_name in sorted(year_map[year].keys()):
            sec_data = year_map[year][sec_name]
            count = len(sec_data["students"])
            total_students += count
            total_sections += 1
            year_group["sections"].append({
                "section_name": sec_data["section_name"],
                "section_id": sec_data["section_id"],
                "course_name": sec_data["course_name"],
                "count": count,
                "students": sec_data["students"],
            })
        groups.append(year_group)

    return {
        "groups": groups,
        "total_students": total_students,
        "total_sections": total_sections,
    }
