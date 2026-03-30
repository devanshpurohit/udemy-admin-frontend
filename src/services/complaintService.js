import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/complaints";

export const getComplaints = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
    }
};

export const deleteComplaint = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
    }
};
