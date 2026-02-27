import api from './api';

// Admin services
export const adminService = {
  // Update user profile
  updateUserProfile: async (userId, profileData) => {
    try {
      const response = await api.put(`/admin/users/${userId}/profile`, profileData);
      return response.data;
    } catch (error) {
      console.error('Admin profile update error:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  },

  // Get system stats
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Get system stats error:', error);
      throw error;
    }
  }
};

export default adminService;
