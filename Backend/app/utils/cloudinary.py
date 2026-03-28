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

