import api from './api';

// @desc    Get site settings
export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
};

// @desc    Update site settings
export const updateSettings = async (formData) => {
  try {
    // Note: formData should be a FormData object for file upload
    const response = await api.put('/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
};
