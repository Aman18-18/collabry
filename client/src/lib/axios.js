import axios from "axios";

let authTokenGetter = async () => null;

export function setAuthTokenGetter(getToken) {
    authTokenGetter = getToken;
}

const developmentApiUrl = new URL(window.location.origin);
developmentApiUrl.port = "5000";

const api = axios.create({
    baseURL: import.meta.env.DEV
        ? developmentApiUrl.origin
        : "https://collabry-1l0j.onrender.com"
});

api.interceptors.request.use(async (config) => {
    const token = await authTokenGetter();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

export default api;
