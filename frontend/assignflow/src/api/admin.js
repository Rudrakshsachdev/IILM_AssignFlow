/*
 * Admin API functions.
 * Communicates with /api/v1/admin/* and /api/v1/academic/admin/* backend endpoints.
 */

import api from './axiosConfig';

export const getAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getAllFaculties = async () => {
  const res = await api.get('/admin/faculties');
  return res.data;
};

export const getAllMappings = async () => {
  const res = await api.get('/academic/admin/faculty-mappings');
  return res.data;
};

export const deleteMapping = async (id) => {
  const res = await api.delete(`/academic/admin/faculty-mappings/${id}`);
  return res.data;
};

// Allowed Users API
export const getAllowedUsers = async () => {
  const res = await api.get('/admin/allowed-users');
  return res.data;
};

export const createAllowedUser = async (data) => {
  const res = await api.post('/admin/allowed-users', data);
  return res.data;
};

export const updateAllowedUser = async (id, data) => {
  const res = await api.put(`/admin/allowed-users/${id}`, data);
  return res.data;
};

export const deleteAllowedUser = async (id) => {
  const res = await api.delete(`/admin/allowed-users/${id}`);
  return res.data;
};

export const uploadAllowedUsersCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/admin/allowed-users/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};
