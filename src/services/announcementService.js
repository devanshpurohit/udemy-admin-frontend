import api from './api';

// Add cache-busting timestamp
const CACHE_BUSTER = new Date().getTime();

// @desc    Get all announcements
export const getAnnouncements = async (params = {}) => {
  try {
    // Add cache-busting parameter
    const response = await api.get('/announcements', { 
      params: { 
        ...params, 
        _: CACHE_BUSTER 
      } 
    });
    console.log('📥 Announcements API response:', response);
    return response;
  } catch (error) {
    console.error('Get announcements error:', error);
    throw error;
  }
};

// @desc    Get announcement by ID
export const getAnnouncementById = async (id) => {
  try {
    const response = await api.get(`/announcements/${id}`);
    return response;
  } catch (error) {
    console.error('Get announcement error:', error);
    throw error;
  }
};

// @desc    Create new announcement
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/announcements', announcementData);
    return response;
  } catch (error) {
    console.error('Create announcement error:', error);
    throw error;
  }
};

// @desc    Update announcement
export const updateAnnouncement = async (id, announcementData) => {
  try {
    const response = await api.put(`/announcements/${id}`, announcementData);
    return response;
  } catch (error) {
    console.error('Update announcement error:', error);
    throw error;
  }
};

// @desc    Delete announcement
export const deleteAnnouncement = async (id) => {
  try {
    const response = await api.delete(`/announcements/${id}`);
    return response;
  } catch (error) {
    console.error('Delete announcement error:', error);
    throw error;
  }
};

// @desc    Toggle announcement status
export const toggleAnnouncementStatus = async (id) => {
  try {
    const response = await api.put(`/announcements/${id}/toggle-status`);
    return response;
  } catch (error) {
    console.error('Toggle announcement status error:', error);
    throw error;
  }
};
