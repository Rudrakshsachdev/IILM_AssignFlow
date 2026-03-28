/*
 * Assignment API functions.
 * Communicates with /api/v1/assignments/* backend endpoints.
 */

import api from './axiosConfig';


export const getAssignments = async ({ subject, status, sort_by, sort_order } = {}) => {
  const params = {};
  if (subject) params.subject = subject;
  if (status) params.status = status;
  if (sort_by) params.sort_by = sort_by;
  if (sort_order) params.sort_order = sort_order;

  const res = await api.get('/assignments/', { params });
  return res.data;
};

export const getAssignmentById = async (id) => {
  const res = await api.get(`/assignments/${id}`);
  return res.data;
};

export const createAssignment = async (data) => {
  const res = await api.post('/assignments/', data);
  return res.data;
};

export const updateAssignment = async (id, data) => {
  const res = await api.put(`/assignments/${id}`, data);
  return res.data;
};

export const deleteAssignment = async (id) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};

export const uploadAssignmentFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/assignments/upload-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { file_url: "...", file_name: "..." }
};
