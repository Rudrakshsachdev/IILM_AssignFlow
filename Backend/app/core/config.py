"""
This module is used to configure the application settings. 
"""

# this import is used to import the BaseSettings class from the pydantic_settings module
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

# this class is used to configure the application settings
class Settings(BaseSettings):
    PROJECT_NAME: str = "IILM AssignFlow"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Should be overridden in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    DATABASE_URL: str = "sqlite:///./assignflow.db"

    # Cloudinary credentials (set these in your .env file)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_PRESET_NAME: str = ""
    CLOUDINARY_UPLOAD_ASSIGNMENT_PRESET: str = ""




    class Config:
        env_file = ".env"

settings = Settings()
