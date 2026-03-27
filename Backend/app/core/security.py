"""
The main purpose of this module is to provide utility functions for handling security-related tasks such as password hashing and JWT token creation. It includes functions to hash passwords, verify passwords, and create access tokens for authentication purposes.
"""


# import for password hashing
from passlib.context import CryptContext

# import for JWT token creation and verification
from jose import jwt

# import for handling datetime operations
from datetime import datetime, timedelta

# import settings from the configuration file for secret key and algorithm
from app.core.config import settings

# Create a password context for hashing and verifying passwords using bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt algorithm."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """Create a JWT access token with an expiration time."""

    # Copy the input data to avoid modifying the original dictionary
    to_encode = data.copy()

    # Set the expiration time for the token
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add the expiration time to the token payload
    to_encode.update({"exp": expire})

    # here, we encode the token using the secret key and algorithm specified in the settings and return the encoded JWT token
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)