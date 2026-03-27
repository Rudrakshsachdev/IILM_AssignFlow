from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    school: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True
        orm_mode = True  # For older pydantic versions compatibility

class Token(BaseModel):
    access_token: str
    token_type: str