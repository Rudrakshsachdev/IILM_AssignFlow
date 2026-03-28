from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base

# Import models so Base knows about them before create_all
from app.models.users import User
from app.models.students import Student
from app.models.faculties import Faculty
from app.models.assignment import Assignment
from app.models.submission import Submission
from app.models.course import Course
from app.models.section import Section
from app.models.subject import Subject
from app.models.faculty_mapping import FacultyMapping
from app.api.routes import auth, dashboards, student, faculty, assignment, submission, academic

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IILM AssignFlow API")

# Setup CORS to allow Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8000", "http://127.0.0.1:8000", "https://iilmassignflow.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# router for authentication
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(dashboards.router, prefix="/api/v1/dashboards", tags=["dashboards"])
app.include_router(student.router, prefix="/api/v1/student", tags=["student"])
app.include_router(faculty.router, prefix="/api/v1/faculty", tags=["faculty"])
app.include_router(assignment.router, prefix="/api/v1/assignments", tags=["assignments"])
app.include_router(submission.router, prefix="/api/v1/submissions", tags=["submissions"])
app.include_router(academic.router, prefix="/api/v1/academic", tags=["academic"])


@app.get("/")
def read_root():
    return {"Hello": "World", "Status": "Active"}

