import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/legal";

export const getLegalContent = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
    }
};

export const updateLegalContent = async (data) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(API_URL, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
    }
};
