"""
Cloudinary integration utility.
Upload and delete profile pictures from Cloudinary.
"""

import requests
from app.core.config import settings

def upload_profile_pic(file, user_id: int) -> str:
    """
    Upload a profile picture to Cloudinary using an unsigned upload preset.
    Uses requests directly to bypass api_key requirements of the SDK.
    """
    url = f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/image/upload"
    
    # We send the file pointer. requests handles multipart/form-data.
    data = {"upload_preset": settings.CLOUDINARY_PRESET_NAME}

    
    files = {
        "file": file
    }

    try:
        response = requests.post(url, data=data, files=files)
        result = response.json()
        
        if response.status_code != 200:
            error_msg = result.get("error", {}).get("message", "Unknown Cloudinary Error")
            raise Exception(f"Cloudinary Error: {error_msg}")
            
        return result.get("secure_url")
    except Exception as e:
        raise Exception(f"Upload failed: {str(e)}")




def delete_profile_pic(user_id: int) -> bool:
    """
    Delete a profile picture from Cloudinary. 
    Note: Deletion usually requires API Secret, so this may not work with just a preset.
    """
    return False


def upload_assignment_file(upload_file, user_id: int) -> str:
    """
    Upload an assignment file (PDF, DOCX, images) to Cloudinary using an unsigned upload preset.
    Uses the 'raw' resource_type for non-image files like PDFs and DOCX.
    For images, uses 'auto' to auto-detect.
    """
    # Use 'auto' resource_type to let Cloudinary detect the file type
    url = f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/auto/upload"

    data = {"upload_preset": settings.CLOUDINARY_UPLOAD_ASSIGNMENT_PRESET}
    
    # Passing proper (filename, file_object, content_type) tuple allows Cloudinary to detect file type
    files = {"file": (upload_file.filename, upload_file.file, upload_file.content_type)}

    try:
        response = requests.post(url, data=data, files=files)
        result = response.json()

        if response.status_code != 200:
            error_msg = result.get("error", {}).get("message", "Unknown Cloudinary Error")
            raise Exception(f"Cloudinary Error: {error_msg}")

        return result.get("secure_url")
    except Exception as e:
        raise Exception(f"Assignment file upload failed: {str(e)}")

