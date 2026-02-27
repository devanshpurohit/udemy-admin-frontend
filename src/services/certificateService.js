import api from './api';

// Add cache-busting timestamp
const CACHE_BUSTER = new Date().getTime();

// @desc    Get all certificates
export const getCertificates = async (params = {}) => {
  try {
    // Add cache-busting parameter
    const response = await api.get('/certificates', { 
      params: { 
        ...params, 
        _: CACHE_BUSTER 
      } 
    });
    console.log('📥 Certificates API response:', response);
    return response;
  } catch (error) {
    console.error('Get certificates error:', error);
    throw error;
  }
};

// @desc    Get certificate by ID
export const getCertificateById = async (id) => {
  try {
    const response = await api.get(`/certificates/${id}`);
    return response;
  } catch (error) {
    console.error('Get certificate error:', error);
    throw error;
  }
};

// @desc    Generate new certificate
export const generateCertificate = async (certificateData) => {
  try {
    const response = await api.post('/certificates/create-manual', certificateData);
    return response;
  } catch (error) {
    console.error('Generate certificate error:', error);
    throw error;
  }
};

// @desc    Update certificate
export const updateCertificate = async (id, certificateData) => {
  try {
    const response = await api.put(`/certificates/${id}`, certificateData);
    return response;
  } catch (error) {
    console.error('Update certificate error:', error);
    throw error;
  }
};

// @desc    Delete certificate
export const deleteCertificate = async (id) => {
  try {
    const response = await api.delete(`/certificates/${id}`);
    return response;
  } catch (error) {
    console.error('Delete certificate error:', error);
    throw error;
  }
};

// @desc    Revoke certificate
export const revokeCertificate = async (id, reason, status = 'revoked') => {
  try {
    const response = await api.put(`/certificates/${id}/revoke`, { reason, status });
    return response;
  } catch (error) {
    console.error('Revoke certificate error:', error);
    throw error;
  }
};

// @desc    Verify certificate
export const verifyCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/verify/${certificateId}`);
    return response;
  } catch (error) {
    console.error('Verify certificate error:', error);
    throw error;
  }
};

// @desc    Get certificates by student
export const getCertificatesByStudent = async (studentId) => {
  try {
    const response = await api.get(`/certificates/student/${studentId}`);
    return response;
  } catch (error) {
    console.error('Get certificates by student error:', error);
    throw error;
  }
};

// @desc    Get certificates by course
export const getCertificatesByCourse = async (courseId) => {
  try {
    const response = await api.get(`/certificates/course/${courseId}`);
    return response;
  } catch (error) {
    console.error('Get certificates by course error:', error);
    throw error;
  }
};
