from fastapi import APIRouter
from app.models.users import User
from app.api.deps import require_role

router = APIRouter()

@router.get("/student-dashboard", dependencies=[require_role(["student"])])
def read_student_dashboard():
    return {"message": "Welcome to the Student Dashboard", "content": "Here are your pending assignments."}

@router.get("/faculty-dashboard", dependencies=[require_role(["faculty"])])
def read_faculty_dashboard():
    return {"message": "Welcome to the Faculty Dashboard", "content": "Here you can create and review assignments."}

@router.get("/admin-dashboard", dependencies=[require_role(["admin"])])
def read_admin_dashboard():
    return {"message": "Welcome to the Admin Dashboard", "content": "Here you can manage users and system settings."}
