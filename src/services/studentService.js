import api from './api';

// @desc    Get all students
export const getStudents = async (params = {}) => {
  try {
    console.log('studentService - Making request with params:', params);
    const response = await api.get('/students', { params });
    console.log('studentService - Response received:', response);
    return response;
  } catch (error) {
    console.error('Get students error:', error);
    throw error;
  }
};

// @desc    Get student by ID
export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response;
  } catch (error) {
    console.error('Get student error:', error);
    throw error;
  }
};

// @desc    Update student status
export const updateStudentStatus = async (id, status) => {
  try {
    const response = await api.put(`/students/${id}/status`, { isActive: status });
    return response;
  } catch (error) {
    console.error('Update student status error:', error);
    throw error;
  }
};

// @desc    Delete student
export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response;
  } catch (error) {
    console.error('Delete student error:', error);
    throw error;
  }
};

// @desc    Get student progress
export const getStudentProgress = async (studentId, courseId) => {
  try {
    const response = await api.get(`/students/${studentId}/courses/${courseId}/progress`);
    return response;
  } catch (error) {
    console.error('Get student progress error:', error);
    throw error;
  }
};

// @desc    Update student progress
export const updateStudentProgress = async (studentId, courseId, progressData) => {
  try {
    const response = await api.put(`/students/${studentId}/courses/${courseId}/progress`, progressData);
    return response;
  } catch (error) {
    console.error('Update student progress error:', error);
    throw error;
  }
};

// @desc    Get student certificates
export const getStudentCertificates = async (studentId) => {
  try {
    const response = await api.get(`/students/${studentId}/certificates`);
    return response;
  } catch (error) {
    console.error('Get student certificates error:', error);
    throw error;
  }
};
