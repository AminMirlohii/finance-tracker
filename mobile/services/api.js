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

export async function getTransactions() {
    const response = await api.get("/transactions");
    return response.data;
}
export async function createTransaction(payload) {
    const response = await api.post("/transactions", payload);
    return response.data;
}
export async function updateTransaction(id, payload) {
    const response = await api.put(`/transactions/${id}`, payload);
    return response.data;
}
export async function deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
}
export async function getAnalyticsSummary() {
    const response = await api.get("/analytics/summary");
    return response.data;
}

export default api;
