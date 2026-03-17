import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

const getNotifications = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export default {
    getNotifications,
    markAsRead
};
