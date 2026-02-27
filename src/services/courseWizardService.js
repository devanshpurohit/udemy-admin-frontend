import api from './api';

// Course Wizard Service for multi-step course creation
const CACHE_BUSTER = new Date().getTime();

// Create or update course draft
export const saveCourseDraft = async (courseData, step = 'basic') => {
  try {
    const response = await api.post('/courses/wizard/draft', {
      ...courseData,
      step,
      _cache: CACHE_BUSTER
    });
    return response.data;
  } catch (error) {
    console.error('Save course draft error:', error);
    throw error;
  }
};

// Update existing course draft
export const updateCourseDraft = async (courseId, courseData, step = 'basic') => {
  try {
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error('Invalid course ID');
    }
    
    const response = await api.put(`/courses/wizard/draft/${courseId}`, {
      ...courseData,
      step,
      _cache: CACHE_BUSTER
    });
    return response.data;
  } catch (error) {
    console.error('Update course draft error:', error);
    throw error;
  }
};

// Get course draft by ID
export const getCourseDraft = async (courseId) => {
  try {
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error('Invalid course ID');
    }
    
    const response = await api.get(`/courses/wizard/draft/${courseId}`, {
      params: { _cache: CACHE_BUSTER }
    });
    return response.data;
  } catch (error) {
    console.error('Get course draft error:', error);
    throw error;
  }
};

// Save course content (lessons)
export const saveCourseContent = async (courseId, lessons) => {
  try {
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error('Invalid course ID');
    }
    
    const response = await api.put(`/courses/wizard/content/${courseId}`, {
      lessons,
      _cache: CACHE_BUSTER
    });
    return response.data;
  } catch (error) {
    console.error('Save course content error:', error);
    throw error;
  }
};

// Save course pricing
export const saveCoursePricing = async (courseId, pricingData) => {
  try {
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error('Invalid course ID');
    }
    
    const response = await api.put(`/courses/wizard/pricing/${courseId}`, {
      ...pricingData,
      _cache: CACHE_BUSTER
    });
    return response.data;
  } catch (error) {
    console.error('Save course pricing error:', error);
    throw error;
  }
};

// Save course media
export const saveCourseMedia = async (courseId, mediaData) => {
  try {
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error('Invalid course ID');
    }
    
    const response = await api.put(`/courses/wizard/media/${courseId}`, {
      ...mediaData,
      _cache: CACHE_BUSTER
    });
    return response.data;
  } catch (error) {
    console.error('Save course media error:', error);
    throw error;
  }
};

// Upload course image
export const uploadCourseImage = async (courseId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('courseImage', imageFile);
    formData.append('_cache', CACHE_BUSTER);

    const response = await api.post(`/courses/wizard/upload/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload course image error:', error);
    throw error;
  }
};

// Upload lesson video
export const uploadLessonVideo = async (courseId, lessonId, videoFile) => {
  try {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('lessonId', lessonId);
    formData.append('_cache', CACHE_BUSTER);

    const response = await api.post(`/courses/wizard/upload-video/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload lesson video error:', error);
    throw error;
  }
};

// Publish course (final step)
export const publishCourse = async (courseId) => {
  try {
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error('Invalid course ID');
    }
    
    const response = await api.post(`/courses/wizard/publish/${courseId}`, {
      _cache: CACHE_BUSTER
    });
    return response.data;
  } catch (error) {
    console.error('Publish course error:', error);
    throw error;
  }
};

// Validate course before publishing
export const validateCourse = async (courseId) => {
  try {
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      throw new Error('Invalid course ID');
    }
    
    const response = await api.get(`/courses/wizard/validate/${courseId}`, {
      params: { _cache: CACHE_BUSTER }
    });
    return response.data;
  } catch (error) {
    console.error('Validate course error:', error);
    throw error;
  }
};

// Get all course drafts for current user
export const getCourseDrafts = async () => {
  try {
    const response = await api.get('/courses/wizard/drafts', {
      params: { _cache: CACHE_BUSTER }
    });
    return response.data;
  } catch (error) {
    console.error('Get course drafts error:', error);
    throw error;
  }
};

// Delete course draft
export const deleteCourseDraft = async (courseId) => {
  try {
    const response = await api.delete(`/courses/wizard/draft/${courseId}`, {
      params: { _cache: CACHE_BUSTER }
    });
    return response.data;
  } catch (error) {
    console.error('Delete course draft error:', error);
    throw error;
  }
};
