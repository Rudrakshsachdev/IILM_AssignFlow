from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import csv
import io
from app.models.allowed_users import AllowedUser
from app.schemas.allowed_users import AllowedUserCreate, AllowedUserUpdate

def check_email_allowed(db: Session, email: str) -> AllowedUser:
    """Check if an email is in the allowed_users table and is active."""
    allowed_user = db.query(AllowedUser).filter(AllowedUser.email == email).first()
    return allowed_user

def add_allowed_user(db: Session, data: AllowedUserCreate) -> AllowedUser:
    """Admin function to add an allowed user."""
    existing = check_email_allowed(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email is already in the allowed list."
        )
    
    new_allowed = AllowedUser(
        email=data.email,
        role=data.role,
        is_active=data.is_active
    )
    db.add(new_allowed)
    db.commit()
    db.refresh(new_allowed)
    return new_allowed

def update_allowed_user(db: Session, user_id: str, data: AllowedUserUpdate) -> AllowedUser:
    """Admin function to update an allowed user's role or status."""
    allowed_user = db.query(AllowedUser).filter(AllowedUser.id == user_id).first()
    if not allowed_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allowed user not found."
        )
    
    if data.role is not None:
        allowed_user.role = data.role
    if data.is_active is not None:
        allowed_user.is_active = data.is_active
        
    db.commit()
    db.refresh(allowed_user)
    return allowed_user

def delete_allowed_user(db: Session, user_id: str):
    """Admin function to remove an allowed user from the list."""
    allowed_user = db.query(AllowedUser).filter(AllowedUser.id == user_id).first()
    if not allowed_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allowed user not found."
        )
    
    db.delete(allowed_user)
    db.commit()

def list_allowed_users(db: Session):
    """Admin function to list all allowed users."""
    return db.query(AllowedUser).all()

def process_csv_upload(db: Session, file_content: str):
    """Admin function to bulk upload users from CSV."""
    reader = csv.DictReader(io.StringIO(file_content))
    
    # Check if necessary columns exist
    if not reader.fieldnames or 'email' not in reader.fieldnames or 'role' not in reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file must contain 'email' and 'role' columns."
        )
        
    added = 0
    skipped = 0
    
    for row in reader:
        email = row.get('email', '').strip()
        role = row.get('role', '').strip().lower()
        
        if not email or not role:
            skipped += 1
            continue
            
        # Optional validation against predefined roles
        if role not in ['student', 'faculty', 'admin']:
            skipped += 1
            continue
            
        existing = check_email_allowed(db, email)
        if not existing:
            new_allowed = AllowedUser(
                email=email,
                role=role,
                is_active=True
            )
            db.add(new_allowed)
            added += 1
        else:
            skipped += 1
            
    db.commit()
    return {"added": added, "skipped": skipped}
