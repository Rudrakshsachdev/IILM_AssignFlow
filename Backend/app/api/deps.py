"""
This module contains dependency functions for FastAPI routes, including user authentication and role-based access control. The `get_current_user` function retrieves the current user based on the JWT token provided in the request. The `RoleChecker` class is a callable that checks if the current user's role is among the allowed roles for a specific route. The `require_role` function is a helper that creates a dependency for role-based access control, which can be used in route definitions to restrict access to certain user roles.
"""


from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.users import User

# Define the OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    
    """
    This function retrieves the current user based on the JWT token provided in the request. It decodes the token, extracts the user's email, and queries the database to find the corresponding user. If the token is invalid or the user does not exist, it raises an HTTP 401 Unauthorized exception.
    Arguments:
    - db: A SQLAlchemy Session object, provided as a dependency.
    - token: A string representing the JWT token, extracted from the request using the OAuth2PasswordBearer scheme.
    Returns:
    - A User object representing the currently authenticated user.
    Raises:
    - HTTPException: If the token is invalid, the email is not found in the token, or the user does not exist in the database.
    """

    # Define the credentials exception to be raised in case of invalid token or user not found, 3 parameters: status code, detail message, and headers for the response
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the JWT token using the secret key and algorithm defined in the settings. Extract the email from the token's payload.
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        # Extract the email from the token's payload. If the email is not found, raise the credentials exception.
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


class RoleChecker:
    """
    This class is a callable that checks if the current user's role is among the allowed roles for a specific route. It is initialized with a list of allowed roles and, when called, it retrieves the current user using the `get_current_user` function. If the user's role is not in the list of allowed roles, it raises an HTTP 403 Forbidden exception. Otherwise, it returns the user object.
    """

    """Initialize the RoleChecker with a list of allowed roles.
    Arguments:
    - allowed_roles: A list of strings representing the roles that are allowed to access a specific route.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    """When called, this method retrieves the current user and checks if their role is among the allowed roles. If not, it raises an HTTP 403 Forbidden exception.

    Arguments:
    - user: A User object representing the currently authenticated user, retrieved using the `get_current_user` function as a dependency.

    Returns:- The User object if the user's role is allowed to access the route.
    Raises:- HTTPException: If the user's role is not in the list of allowed roles, an HTTP 403 Forbidden exception is raised with a detail message indicating that the operation is not permitted.
    """
    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user


def require_role(allowed_roles: List[str]):
    """This function is a helper that creates a dependency for role-based access control. It takes a list of allowed roles as an argument and returns a dependency that can be used in route definitions to restrict access to certain user roles. When used in a route, it will ensure that only users with the specified roles can access that route, otherwise, it will raise an HTTP 403 Forbidden exception.
    Arguments:   
    - allowed_roles: A list of strings representing the roles that are allowed to access a specific route
    
    Returns:- A dependency that can be used in FastAPI route definitions to enforce role-based access control.
    """
    return Depends(RoleChecker(allowed_roles))