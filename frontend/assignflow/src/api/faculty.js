/*
 * Faculty profile API functions.
 * Communicates with /api/v1/faculty/* backend endpoints.
 */

import api from './axiosConfig';


export const getFacultyProfile = async () => {
  const res = await api.get('/faculty/profile');
  return res.data;
};

export const createFacultyProfile = async (data) => {
  const res = await api.post('/faculty/profile', data);
  return res.data;
};

export const updateFacultyProfile = async (data) => {
  const res = await api.put('/faculty/profile', data);
  return res.data;
};

// For use during profile creation (just returns URL)
export const uploadFacultyPicOnly = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/faculty/profile/upload-only', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { faculty_profile_pic: "..." }
};

// For use when profile exists (updates DB and returns profile)
export const uploadAndUpdateFacultyPic = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/faculty/profile/upload-pic', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // Full FacultyResponse
};

export const getFacultyStats = async () => {
  const res = await api.get('/faculty/stats');
  return res.data;
};

export const getFacultyStudents = async () => {
  const res = await api.get('/faculty/students');
  return res.data;
};
