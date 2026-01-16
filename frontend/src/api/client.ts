import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const authStore = useAuthStore();
        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const authStore = useAuthStore();
            const success = await authStore.refreshToken();

            if (success) {
                originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
                return apiClient(originalRequest);
            } else {
                authStore.logout();
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
export { API_BASE_URL };
