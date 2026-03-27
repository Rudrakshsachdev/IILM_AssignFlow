"""
This module contains the authentication services for the application, including user registration and login functionalities. It interacts with the database to manage user data and uses security utilities for password hashing and token generation. The main functions include registering a new user, authenticating a user, and logging in a user by returning an access token upon successful authentication.
"""




# this import is for database session management
from sqlalchemy.orm import Session

# this import is for handling HTTP exceptions in FastAPI
from fastapi import HTTPException

# this import is for handling user definitions and schemas
from models.users import User

# this import from core.security is for password hashing, verifying passwords, and creating access tokens
from core.security import hash_password, verify_password, create_access_token

# this import is for validating email domains based on user roles
from utils.email_validator import validate_email_domain

def register_user(db: Session, user_data):
    """Registers a new user in the database after validating the email domain and hashing the password."""

    # Validate the email domain based on the user's role
    if not validate_email_domain(user_data.email, user_data.role):
        raise HTTPException(status_code=400, detail="Invalid email domain for the specified role.")
    
    # Check if the user already exists in the database based on the email
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    # Create a new user instance with the provided data, hashing the password before storing it in the database
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),  # Hash the password before storing
        role=user_data.role,
        school=user_data.school
    )

    # Add the new user to the database session, commit the transaction, and refresh the instance to get the updated data from the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def authenticate_user(db: Session, email: str, password: str):
    """Authenticates a user by verifying the email and password, and returns a JWT access token if successful."""

    # Query the database for a user with the provided email
    user = db.query(User).filter(User.email == email).first()

    # If the user does not exist or the password is incorrect, raise an HTTP exception with a 401 status code
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # If authentication is successful, create a JWT access token containing the user's ID and role, and return it in a dictionary format
    access_token = create_access_token(data={"user_id": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


def login_user(db: Session, login_data):
    """Logs in a user by authenticating their credentials and returning an access token."""

    # Authenticate the user using the provided email and password, and return the access token if successful
    return authenticate_user(db, login_data.email, login_data.password)