import api from './api';

// Wizard APIs
export const saveCourseDraft = async (courseData) => {
  try {
    const response = await api.post('/courses/wizard/draft', courseData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCourseDraft = async (id, courseData) => {
  try {
    const response = await api.put(`/courses/wizard/draft/${id}`, courseData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCourseDraft = async (id) => {
  try {
    const response = await api.get(`/courses/wizard/draft/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const saveCourseContent = async (id, contentData) => {
  try {
    console.log('🔍 Saving course content:', contentData);
    const response = await api.put(`/courses/wizard/content/${id}`, contentData);
    console.log('🔍 Save course content response:', response);
    return response;
  } catch (error) {
    console.error('❌ Save course content error:', error);
    throw error;
  }
};

export const saveCoursePricing = async (id, pricingData) => {
  try {
    const response = await api.put(`/courses/wizard/pricing/${id}`, pricingData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const saveCourseMedia = async (id, mediaData) => {
  try {
    const response = await api.put(`/courses/wizard/media/${id}`, mediaData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const publishCourse = async (id) => {
  try {
    const response = await api.post(`/courses/wizard/publish/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const validateCourse = async (id) => {
  try {
    const response = await api.get(`/courses/wizard/validate/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all courses
export const getCourses = async (params = {}) => {
  try {
    const response = await api.get('/courses', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get single course
export const getCourse = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create new course
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/courses', courseData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update course
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/courses/${id}`, courseData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete course
export const deleteCourse = async (id) => {
  try {
    console.log('Making DELETE request to:', `/courses/${id}`);
    console.log('API base URL:', api.defaults.baseURL);
    const response = await api.delete(`/courses/${id}`);
    console.log('DELETE response:', response);
    return response;
  } catch (error) {
    console.error('Delete course service error:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    throw error;
  }
};

// Add lesson to course
export const addLesson = async (courseId, lessonData) => {
  try {
    const response = await api.post(`/courses/${courseId}/lessons`, lessonData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update lesson
export const updateLesson = async (courseId, lessonId, lessonData) => {
  try {
    const response = await api.put(`/courses/${courseId}/lessons/${lessonId}`, lessonData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete lesson
export const deleteLesson = async (courseId, lessonId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Enroll in course
export const enrollCourse = async (courseId) => {
  try {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Upload course thumbnail
export const uploadThumbnail = async (courseId, file) => {
  try {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const response = await api.post(`/courses/${courseId}/upload-thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Upload lesson video
export const uploadVideo = async (courseId, lessonId, file) => {
  try {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await api.post(`/courses/${courseId}/lessons/${lessonId}/upload-video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Section operations
export const updateSection = async (courseId, sectionId, sectionData) => {
  try {
    const response = await api.put(`/courses/${courseId}/sections/${sectionId}`, sectionData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteSection = async (courseId, sectionId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/sections/${sectionId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lesson operations in sections
export const updateLessonInSection = async (courseId, sectionId, lessonId, lessonData) => {
  try {
    const response = await api.put(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, lessonData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteLessonFromSection = async (courseId, sectionId, lessonId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Quiz operations
export const updateQuiz = async (courseId, sectionId, lessonId, quizId, quizData) => {
  try {
    const response = await api.put(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz/${quizId}`, quizData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteQuiz = async (courseId, sectionId, lessonId, quizId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/quiz/${quizId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get course list (ID and Title)
export const getCourseList = async () => {
  try {
    const response = await api.get('/courses/list');
    return response;
  } catch (error) {
    throw error;
  }
};
