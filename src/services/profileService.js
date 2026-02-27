import api from './api';

// Profile image upload service (using FormData for file upload)
export const uploadProfileImage = async (imageFile) => {
  try {
    console.log('🔍 Frontend - Uploading profile image:', imageFile);
    console.log('🔍 Frontend - File name:', imageFile.name);
    console.log('🔍 Frontend - File size:', imageFile.size);
    console.log('🔍 Frontend - File type:', imageFile.type);
    
    const formData = new FormData();
    formData.append('avatar', imageFile);
    
    console.log('🔍 Frontend - FormData created, sending to backend...');
    
    const response = await api.post('/auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('🔍 Frontend - Raw axios response:', response);
    console.log('🔍 Frontend - Response type:', typeof response);
    console.log('🔍 Frontend - Response keys:', Object.keys(response));
    
    return response;
  } catch (error) {
    console.error('Profile image upload error:', error);
    console.error('Profile image upload error details:', error.response?.data);
    throw error;
  }
};

// Update profile (clean data - no base64)
export const updateProfile = async (profileData) => {
  try {
    // Remove base64 if present - we'll use file upload instead
    const cleanProfileData = { ...profileData };
    if (cleanProfileData.profileImage && cleanProfileData.profileImage.startsWith('data:')) {
      delete cleanProfileData.profileImage;
    }
    
    const response = await api.put('/auth/profile', cleanProfileData);
    return response;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

// Re-fetch user after update
export const refetchUser = async () => {
  try {
    console.log('🔍 Frontend - Re-fetching user data...');
    const response = await api.get('/auth/me');
    console.log('🔍 Frontend - Refetch response:', response);
    console.log('🔍 Frontend - Refetch response data:', response.data);
    return response;
  } catch (error) {
    console.error('Refetch user error:', error);
    console.error('Refetch user error details:', error.response?.data);
    throw error;
  }
};
