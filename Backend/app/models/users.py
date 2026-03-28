from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # student / faculty / admin
    school = Column(String, nullable=True)

    # One-to-one relationship with Student profile
    student = relationship("Student", back_populates="user", uselist=False)

    # One-to-one relationship with Faculty profile
    faculty = relationship("Faculty", back_populates="user", uselist=False)