import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:4000/api",
    timeout: 10000,
});

let authToken = null;

api.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

export function setAuthToken(token) {
    authToken = token;
}

export async function loginRequest(payload) {
    const response = await api.post("/auth/login", payload);
    return response.data;
}

export async function registerRequest(payload) {
    const response = await api.post("/auth/register", payload);
    return response.data;
}

export default api;
