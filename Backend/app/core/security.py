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


def create_password_reset_token(email: str, current_hashed_password: str) -> str:
    """Create a stateless, single-use password reset token valid for 15 minutes."""
    expire = datetime.utcnow() + timedelta(minutes=15)
    
    # We embed the current hashed password directly into the data payload.
    # If the user successfully resets their password, the database hash will change,
    # and this specific token will automatically become invalid during verification.
    to_encode = {
        "exp": expire,
        "sub": email,
        "hash": current_hashed_password[-10:]  # Just a chunk of it is enough to invalidate on change
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password_reset_token(token: str, current_hashed_password: str):
    """
    Verify the reset token. 
    Returns the email (sub) if valid and the password hasn't been changed yet.
    Returns None if expired, invalid, or the password was already changed.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_hash_chunk: str = payload.get("hash")
        
        if email is None or token_hash_chunk is None:
            return None
            
        # Verify the hash chunk matches their CURRENT database password hash.
        # If they already reset it, this will fail.
        if token_hash_chunk != current_hashed_password[-10:]:
            return None
            
        return email
    except jwt.JWTError:
        return None