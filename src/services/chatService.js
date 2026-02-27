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
    
    console.log('📥 Message sent successfully:', response);
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
    
    console.log('📥 Full API response:', response);
    console.log('📥 Response data:', response.data);
    console.log('📥 Response success:', response.data?.success);
    console.log('📥 Response chats:', response.data?.data?.chats);
    
    // Return the actual backend response structure
    return response.data;  // This should be {success: true, data: {chats: [...], pagination: {...}}}
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
