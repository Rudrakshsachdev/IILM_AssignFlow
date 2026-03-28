/*
 * Student profile API functions.
 * Communicates with /api/v1/student/* backend endpoints.
 */

import api from './axiosConfig';


export const getStudentProfile = async () => {
  const res = await api.get('/student/profile');
  return res.data;
};

export const createStudentProfile = async (data) => {
  const res = await api.post('/student/profile', data);
  return res.data;
};

export const updateStudentProfile = async (data) => {
  const res = await api.put('/student/profile', data);
  return res.data;
};

// For use during profile creation (just returns URL)
export const uploadProfilePicOnly = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/student/profile/upload-only', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { student_profile_pic: "..." }
};

// For use when profile exists (updates DB and returns profile)
export const uploadAndUpdateProfilePic = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/student/profile/upload-pic', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // Full StudentResponse
};


