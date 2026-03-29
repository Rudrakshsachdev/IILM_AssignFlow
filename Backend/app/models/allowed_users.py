import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from app.db.base import Base

class AllowedUser(Base):
    __tablename__ = "allowed_users"

    # Using string representation of UUID for broad database compatibility
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    email = Column(String, unique=True, nullable=False, index=True)
    role = Column(String, nullable=False)  # "student", "faculty", "admin"
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
