/*
 * Academic API functions.
 * Communicates with /api/v1/academic/* backend endpoints.
 */

import api from './axiosConfig';

export const getCourses = async () => {
  const res = await api.get('/academic/courses');
  return res.data;
};

export const getSections = async (courseId) => {
  const params = {};
  if (courseId) params.course_id = courseId;
  const res = await api.get('/academic/sections', { params });
  return res.data;
};

export const getSubjects = async () => {
  const res = await api.get('/academic/subjects');
  return res.data;
};

export const getMyMappings = async () => {
  const res = await api.get('/academic/faculty-mappings');
  return res.data;
};

export const createFacultyMapping = async (data) => {
  const res = await api.post('/academic/faculty-mappings', data);
  return res.data;
};

export const seedAcademicData = async () => {
  const res = await api.post('/academic/seed');
  return res.data;
};
