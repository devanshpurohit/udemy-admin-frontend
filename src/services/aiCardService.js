import api from './api';

// Generate random AI Card
export const generateCard = async () => {
  try {
    const response = await api.post('/ai-cards/generate');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all AI Cards
export const getCards = async () => {
  try {
    const response = await api.get('/ai-cards');
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete AI Card
export const deleteCard = async (id) => {
  try {
    const response = await api.delete(`/ai-cards/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

const aiCardService = {
  generateCard,
  getCards,
  deleteCard
};


export default aiCardService;
