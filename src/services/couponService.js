import api from './api';

// Rate limiting cache
let lastRequestTime = 0;
const REQUEST_DELAY = 6000; // 6 seconds between requests

// @desc    Get all coupons with rate limiting
export const getCoupons = async (params = {}) => {
  try {
    // Rate limiting check
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_DELAY) {
      const waitTime = REQUEST_DELAY - (now - lastRequestTime);
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
    
    // Add cache-busting parameter
    const response = await api.get('/coupons', { 
      params: { 
        ...params, 
        _: new Date().getTime() 
      } 
    });
    console.log('📥 Coupons API response:', response);
    return response;
  } catch (error) {
    console.error('Get coupons error:', error);
    
    // Handle rate limiting error
    if (error.message && error.message.includes('Too many requests')) {
      console.log('⚠️ Rate limited, waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return getCoupons(params); // Retry once
    }
    
    throw error;
  }
};

// @desc    Get coupon by ID
export const getCouponById = async (id) => {
  try {
    const response = await api.get(`/coupons/${id}`);
    return response;
  } catch (error) {
    console.error('Get coupon error:', error);
    throw error;
  }
};

// @desc    Create new coupon
export const createCoupon = async (couponData) => {
  try {
    const response = await api.post('/coupons', couponData);
    return response;
  } catch (error) {
    console.error('Create coupon error:', error);
    throw error;
  }
};

// @desc    Update coupon
export const updateCoupon = async (id, couponData) => {
  try {
    console.log('🔧 Updating coupon with ID:', id);
    console.log('📤 Coupon data:', couponData);
    
    const response = await api.put(`/coupons/${id}`, couponData);
    console.log('📥 Update response:', response);
    return response;
  } catch (error) {
    console.error('Update coupon error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// @desc    Delete coupon
export const deleteCoupon = async (id) => {
  try {
    const response = await api.delete(`/coupons/${id}`);
    return response;
  } catch (error) {
    console.error('Delete coupon error:', error);
    throw error;
  }
};
