import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllReviews = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/all-reviews`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
    }
};

export const updateReviewStatus = async (id, isApproved) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`${API_URL}/reviews/${id}/approve`, { isApproved }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
    }
};

export const deleteReview = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`${API_URL}/reviews/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
    }
};
