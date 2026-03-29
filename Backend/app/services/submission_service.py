"""
Submission service containing business logic for student assignment submissions.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import datetime
from app.models.submission import Submission
from app.models.assignment import Assignment
from app.schemas.submission import SubmissionEvaluateRequest


def submit_assignment(db: Session, student_id: int, assignment_id: int, file_url: str, section_id: int = None) -> Submission:
    """
    This function handles the submission of an assignment by a student. It first verifies that the assignment exists and is published. Then, it checks if the student is allowed to submit to this assignment based on their section. It also prevents double submissions by checking if the student has already submitted the assignment. If all checks pass, it determines if the submission is late based on the assignment's deadline and saves the submission to the database.

    Arguments:
    db (Session): The database session used to perform the query.
    student_id (int): The ID of the student submitting the assignment.
    assignment_id (int): The ID of the assignment being submitted.
    file_url (str): The URL of the submitted file.
    section_id (int, optional): The ID of the student's section. Defaults to None.

    Returns:
    Submission: The submitted assignment.
    """
    # 1. Verify assignment exists and is published
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.status == "published"
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or not published.")

    # 2. Section-scoped access control: student can only submit to their section's assignments
    if section_id and assignment.section_id and assignment.section_id != section_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This assignment is not assigned to your section."
        )

    # 3. Prevent double submission
    existing_sub = db.query(Submission).filter(
        Submission.student_id == student_id,
        Submission.assignment_id == assignment_id
    ).first()
    
    if existing_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this assignment."
        )

    # 4. Determine if late
    current_time = datetime.utcnow()
    sub_status = "late" if current_time > assignment.deadline else "pending"

    # 5. Save
    new_submission = Submission(
        assignment_id=assignment_id,
        student_id=student_id,
        file_url=file_url,
        status=sub_status
    )
    
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    
    return new_submission


def get_student_submissions(db: Session, student_id: int) -> List[Submission]:
    return db.query(Submission).filter(Submission.student_id == student_id).all()


def get_student_submissions_with_assignment(db: Session, student_id: int) -> List[dict]:
    """
    Fetch all submissions for a student, joining with Assignment to include title, subject, and deadline.
    """
    results = db.query(Submission, Assignment).filter(
        Submission.student_id == student_id
    ).join(
        Assignment, Submission.assignment_id == Assignment.id
    ).order_by(Submission.submitted_at.desc()).all()
    
    formatted_results = []
    for sub, assignment in results:
        sub_dict = {
            "id": sub.id,
            "assignment_id": sub.assignment_id,
            "student_id": sub.student_id,
            "file_url": sub.file_url,
            "status": sub.status,
            "marks_obtained": sub.marks_obtained,
            "feedback": sub.feedback,
            "evaluated_at": sub.evaluated_at,
            "submitted_at": sub.submitted_at,
            "created_at": sub.created_at,
            "updated_at": sub.updated_at,
            "assignment_title": assignment.title,
            "subject": assignment.subject,
            "deadline": assignment.deadline
        }
        formatted_results.append(sub_dict)
        
    return formatted_results


def get_assignment_submissions(db: Session, assignment_id: int) -> List[Submission]:
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).all()


def get_assignment_submissions_with_student(db: Session, assignment_id: int, faculty_id: int) -> List[dict]:
    """
    Fetch all submissions for a specific assignment, including the student's details.
    Ensures that the faculty requesting this owns the assignment.
    """
    from app.models.students import Student
    
    # Verify assignment exists and is owned by the faculty
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.faculty_id == faculty_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found or you don't have permission to view it."
        )
        
    # Join Submission and Student tables using the student_id (which maps to User.id)
    results = db.query(Submission, Student).filter(
        Submission.assignment_id == assignment_id
    ).join(
        Student, Submission.student_id == Student.user_id
    ).all()
    
    formatted_results = []
    for sub, student in results:
        sub_dict = {
            "id": sub.id,
            "assignment_id": sub.assignment_id,
            "student_id": sub.student_id,
            "file_url": sub.file_url,
            "status": sub.status,
            "marks_obtained": sub.marks_obtained,
            "feedback": sub.feedback,
            "evaluated_at": sub.evaluated_at,
            "submitted_at": sub.submitted_at,
            "created_at": sub.created_at,
            "updated_at": sub.updated_at,
            "student_name": student.student_name,
            "student_urn": student.student_urn,
            "student_course": student.student_course,
            "student_branch": student.student_branch,
            "student_year": student.student_year,
            "student_sem": student.student_sem,
            "student_section": student.student_section
        }
        formatted_results.append(sub_dict)
        
    return formatted_results


def evaluate_submission(db: Session, submission_id: str, faculty_id: int, data: SubmissionEvaluateRequest) -> Submission:
    """
    Evaluates a single student submission.
    Ensures that the submission belongs to an assignment owned by the faculty.
    """
    # Join Submission and Assignment to verify ownership
    result = db.query(Submission, Assignment).filter(
        Submission.id == submission_id
    ).join(
        Assignment, Submission.assignment_id == Assignment.id
    ).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found."
        )

    submission, assignment = result

    if assignment.faculty_id != faculty_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to evaluate this submission."
        )

    submission.marks_obtained = data.marks_obtained
    submission.feedback = data.feedback
    submission.status = data.status
    submission.evaluated_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)
    return submission
