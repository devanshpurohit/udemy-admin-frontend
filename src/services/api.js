import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  timeout: 30000,  // Increased from 10000 to 30000
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      console.log('Token present:', !!token);
    } else {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      console.log('No token found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    console.log('API Error:', error.response?.status, error.config?.url);
    console.log('Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      
      console.warn(`Rate limit hit. Waiting ${waitTime}ms before retry...`);
      
      // Create a more descriptive error message
      const rateLimitError = new Error(
        `Too many requests. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`
      );
      rateLimitError.status = 429;
      rateLimitError.retryAfter = waitTime;
      
      return Promise.reject(rateLimitError);
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
