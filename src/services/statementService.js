import api from './api';

// Get all statements with optional filters
export const getStatements = async (params = {}) => {
  try {
    return await api.get('/statements', { params }); 
  } catch (error) {
    throw error;
  }
};

// Get single statement by ID
export const getStatement = async (id) => {
  try {
    return await api.get(`/statements/${id}`);
  } catch (error) {
    throw error;
  }
};

// Download statement
export const downloadStatement = async (id) => {
  try {
    return await api.get(`/statements/${id}/download`, {
      responseType: 'blob'
    });
  } catch (error) {
    throw error;
  }
};

// Update statement status
export const updateStatementStatus = async (id, status) => {
  try {
    return await api.put(`/statements/${id}/status`, { status });
  } catch (error) {
    throw error;
  }
};
