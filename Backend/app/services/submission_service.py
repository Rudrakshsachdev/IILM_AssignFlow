"""
Submission service containing business logic for student assignment submissions.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import datetime
from app.models.submission import Submission
from app.models.assignment import Assignment


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
    sub_status = "late" if current_time > assignment.deadline else "submitted"

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


def get_assignment_submissions(db: Session, assignment_id: int) -> List[Submission]:
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
