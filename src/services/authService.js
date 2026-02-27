import api from './api';

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    console.log('🔍 Attempting login with credentials:', credentials);
    
    const response = await api.post('/auth/login', credentials);
    
    console.log('📥 Raw API response:', response);
    console.log('📥 Response success:', response.success);
    console.log('📥 Response data:', response.data);
    console.log('📥 Response type:', typeof response);
    console.log('📥 Response keys:', Object.keys(response));
    
    // Check if response exists and has success
    if (!response) {
      console.error('❌ No response received');
      throw new Error('No response received');
    }
    
    // Backend returns: {success: true, data: {user: {...}, token: "..."}}
    if (response.success === true && response.data) {
      const userData = response.data.user;
      const tokenData = response.data.token;
      
      console.log('✅ Extracted user data:', userData);
      console.log('✅ Extracted token:', tokenData);
      console.log('✅ User data type:', typeof userData);
      console.log('✅ Token data type:', typeof tokenData);
      
      // Validate extracted data
      if (!userData || !tokenData) {
        console.error('❌ Missing user data or token');
        console.error('❌ User data:', userData);
        console.error('❌ Token data:', tokenData);
        throw new Error('Invalid response data');
      }
      
      // Store in localStorage
      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ User data saved to localStorage:', userData);
      
      // Verify storage
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      console.log('🔍 Verification - Stored user:', storedUser);
      console.log('🔍 Verification - Stored token:', storedToken);
      
      return response;
    } else {
      console.error('❌ Login failed:', response.message);
      console.error('❌ Response success:', response.success);
      console.error('❌ Response data:', response.data);
      throw new Error(response.message || 'Login failed');
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    throw err;
  }
};

// Verify email with OTP
export const verifyEmail = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response;
  } catch (error) {
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwords) => {
  try {
    const response = await api.put('/auth/change-password', passwords);
    return response;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Use React Router's navigate instead of window.location
  window.location.href = '/login';
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get stored user data
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  console.log('Getting user from localStorage:', user);
  const parsedUser = user ? JSON.parse(user) : null;
  console.log('Parsed user:', parsedUser);
  return parsedUser;
};
