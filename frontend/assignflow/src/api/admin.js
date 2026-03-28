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
