"""
Submission service containing business logic for student assignment submissions.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import datetime
from app.models.submission import Submission
from app.models.assignment import Assignment


def submit_assignment(db: Session, student_id: int, assignment_id: int, file_url: str) -> Submission:
    # 1. Verify exact assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    # 2. Prevent double submission
    existing_sub = db.query(Submission).filter(
        Submission.student_id == student_id,
        Submission.assignment_id == assignment_id
    ).first()
    
    if existing_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this assignment."
        )

    # 3. Determine if late
    current_time = datetime.utcnow()
    sub_status = "late" if current_time > assignment.deadline else "submitted"

    # 4. Save
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
