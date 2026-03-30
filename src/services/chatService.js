import api from './api';

// @desc    Send message (no AI)
export const sendMessage = async (message, sessionId) => {
  try {
    console.log('📤 Sending message:', message);
    console.log('🆔 Session ID:', sessionId);
    
    const response = await api.post('/chat/send', {
      message: message.trim(),
      sessionId: sessionId || `session_${Date.now()}`
    });
    
    return response;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

// @desc    Get chat history
export const getChatHistory = async (sessionId) => {
  try {
    console.log('📚 Fetching chat history for session:', sessionId);
    
    const response = await api.get('/chat/history', {
      params: { 
        sessionId,
        limit: 10
      }
    });
    
    return response;
  } catch (error) {
    console.error('Get chat history error:', error);
    throw error;
  }
};

// @desc    Clear chat history
export const clearChatHistory = async (sessionId) => {
  try {
    console.log('🗑️ Clearing chat history for session:', sessionId);
    
    const response = await api.delete('/chat/clear', {
      data: { sessionId }
    });
    
    console.log('✅ Chat history cleared');
    return response;
  } catch (error) {
    console.error('Clear chat history error:', error);
    throw error;
  }
};

// @desc    Get all users for admin chat
export const getAllUsers = async () => {
  try {
    console.log('👥 Fetching all users...');
    
    const response = await api.get('/chat/users');
    
    console.log('👥 Users response:', response);
    return response;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

// @desc    Get all pending questions for admin
export const getPendingQuestions = async () => {
  try {
    const response = await api.get('/questions/admin/pending');
    return response;
  } catch (error) {
    console.error('Get pending questions error:', error);
    throw error;
  }
};

// @desc    Get all public/answered questions
export const getPublicQuestions = async () => {
  try {
    const response = await api.get('/questions/public');
    return response;
  } catch (error) {
    console.error('Get public questions error:', error);
    throw error;
  }
};

// @desc    Answer a question
export const answerQuestion = async (questionId, answer, isPublic = false) => {
  try {
    const response = await api.put(`/questions/${questionId}/answer`, {
      answer,
      isPublic
    });
    return response;
  } catch (error) {
    console.error('Answer question error:', error);
    throw error;
  }
};

// @desc    Get all conversations
export const getConversations = async () => {
  try {
    const response = await api.get('/conversations');
    return response;
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
};

// @desc    Get messages for a conversation
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response;
  } catch (error) {
    console.error('Get conversation messages error:', error);
    throw error;
  }
};

// @desc    Create or get a conversation
export const createOrGetConversation = async (receiverId) => {
  try {
    const response = await api.post('/conversations', { receiverId });
    return response;
  } catch (error) {
    console.error('Create or get conversation error:', error);
    throw error;
  }
};
// @desc    Create a new FAQ
export const createFAQ = async (question, answer, isPublic = true) => {
  try {
    const response = await api.post('/questions/admin/create', {
      question,
      answer,
      isPublic
    });
    return response;
  } catch (error) {
    console.error('Create FAQ error:', error);
    throw error;
  }
};
