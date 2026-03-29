from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class AllowedUserBase(BaseModel):
    email: EmailStr
    role: str
    is_active: bool = True

class AllowedUserCreate(AllowedUserBase):
    pass

class AllowedUserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None

class AllowedUserResponse(AllowedUserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
