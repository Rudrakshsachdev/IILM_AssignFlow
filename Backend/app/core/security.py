"""
The main purpose of this module is to provide utility functions for handling security-related tasks such as password hashing and JWT token creation. It includes functions to hash passwords, verify passwords, and create access tokens for authentication purposes.
"""


# import for password hashing
import bcrypt

# import for JWT token creation and verification
from jose import jwt

# import for handling datetime operations
from datetime import datetime, timedelta

# import settings from the configuration file for secret key and algorithm
from app.core.config import settings

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt algorithm."""

    # this pwd_bytes is used to encode the password into bytes
    pwd_bytes = password.encode('utf-8')

    # this salt is used to generate a random salt for the password
    salt = bcrypt.gensalt()
    
    # this bcrypt.hashpw() function is used to hash the password
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hashed password."""

    # this password_byte_enc is used to encode the plaintext password into bytes
    password_byte_enc = plain_password.encode('utf-8')

    # this hashed_password_byte_enc is used to encode the hashed password into bytes
    hashed_password_byte_enc = hashed_password.encode('utf-8')

    # this bcrypt.checkpw() function is used to verify the plaintext password against the hashed password
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)


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