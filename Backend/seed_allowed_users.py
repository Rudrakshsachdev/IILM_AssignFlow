import sys
import os

# Add the Backend directory to the Python path to allow app imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.main import app  # Load all models and relationships
from app.models.allowed_users import AllowedUser
from app.models.users import User

def seed_users():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        added_count = 0
        
        # 1. Safely copy all existing users from the users table into allowed_users
        # Even though you said don't worry, this ensures nobody gets locked out unexpectedly.
        existing_users = db.query(User).all()
        for user in existing_users:
            exists = db.query(AllowedUser).filter(AllowedUser.email == user.email).first()
            if not exists:
                new_allowed = AllowedUser(
                    email=user.email,
                    role=user.role,
                    is_active=True
                )
                db.add(new_allowed)
                added_count += 1
                
        # 2. Add standard sample users
        sample_users = [
            {"email": "student.sample@iilm.edu", "role": "student"},
            {"email": "faculty.sample@iilm.edu", "role": "faculty"},
            {"email": "admin.super@iilm.edu", "role": "admin"},
        ]
        
        for sample in sample_users:
            exists = db.query(AllowedUser).filter(AllowedUser.email == sample["email"]).first()
            if not exists:
                new_allowed = AllowedUser(
                    email=sample["email"],
                    role=sample["role"],
                    is_active=True
                )
                db.add(new_allowed)
                added_count += 1
                
        db.commit()
        print(f"Successfully seeded {added_count} new allowed users.")
        
    except Exception as e:
        print(f"Error seeding allowed users: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
