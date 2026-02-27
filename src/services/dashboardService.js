import api from './api';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get revenue data
export const getRevenueData = async (period = 'monthly') => {
  try {
    const response = await api.get('/dashboard/revenue', { params: { period } });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get course performance data
export const getCoursePerformance = async () => {
  try {
    const response = await api.get('/dashboard/course-performance');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get enrollment trends
export const getEnrollmentTrends = async (period = 'monthly') => {
  try {
    const response = await api.get('/dashboard/enrollment-trends', { params: { period } });
    return response;
  } catch (error) {
    throw error;
  }
};
