from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base

# Import models so Base knows about them before create_all
from app.models.users import User
from app.api.routes import auth, dashboards

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


@app.get("/")
def read_root():
    return {"Hello": "World", "Status": "Active"}
