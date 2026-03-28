from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.users import User
from app.schemas.users import UserCreate, UserLogin, Token, UserOut
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_pwd,
        role=user.role,
        school=user.school
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_credentials.email).first()
    if not db_user or not verify_password(user_credentials.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(db_user.email), "role": str(db_user.role)})
    return {"access_token": access_token, "token_type": "bearer"}


from app.schemas.users import ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import create_password_reset_token, verify_password_reset_token

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == request.email).first()
    if not db_user:
        # We don't want to leak whether the email exists for security reasons
        return {"message": "If that email is registered, a reset link will be sent."}
    
    token = create_password_reset_token(db_user.email, db_user.password)
    
    # In a real app, send this via Email. Here, we print it for testing.
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    print(f"\n=============================================")
    print(f"PASSWORD RESET LINK FOR {db_user.email}:")
    print(reset_link)
    print(f"=============================================\n")
    
    return {"message": "If that email is registered, a reset link will be sent."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # 1. Decode token (without verification yet) just to get the email to find the user
    # because we need the user's CURRENT hashed password to actually verify the token
    from jose import jwt, JWTError
    from app.core.config import settings
    try:
        unverified_payload = jwt.decode(request.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_signature": False})
        email = unverified_payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")

    if not email:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    # 2. Now verify the token properly using the user's current hashed password
    verified_email = verify_password_reset_token(request.token, db_user.password)
    
    if not verified_email:
        raise HTTPException(status_code=400, detail="Token is invalid, expired, or has already been used.")

    # 3. Hash the new password and update
    hashed_pwd = hash_password(request.new_password)
    db_user.password = hashed_pwd
    db.commit()
    
    return {"message": "Password has been reset successfully"}