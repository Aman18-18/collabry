import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.DEV
        ? "http://localhost:5000"
        : "https://collabry-1l0j.onrender.com"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
