import api from './axiosConfig';

/**
 * Submit an assignment.
 * @param {Object} data - { assignment_id, file_url }
 */
export const submitAssignment = async (data) => {
  const response = await api.post('/submissions/', data);
  return response.data;
};

/**
 * Get all submissions for the logged-in student.
 */
export const getMySubmissions = async () => {
  const response = await api.get('/submissions/my');
  return response.data;
};

/**
 * Upload a submission file to Cloudinary via backend.
 * @param {File} file 
 */
export const uploadSubmissionFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/submissions/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
