import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:4000/api",
    timeout: 10000,
});

export async function login(payload) {
    const response = await api.post("/auth/login", payload);
    return response.data;
}

export async function register(payload) {
    const response = await api.post("/auth/register", payload);
    return response.data;
}

export default api;