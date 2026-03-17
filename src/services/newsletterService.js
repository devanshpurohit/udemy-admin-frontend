import api from './api';

const getSubscribers = async () => {
    try {
        const response = await api.get('/newsletter');
        return response;
    } catch (error) {
        throw error;
    }
};

const newsletterService = {
    getSubscribers
};

export default newsletterService;
