import apiClient from './client';

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/token/login', null, {
        auth: { username, password },
    });
    return response.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await apiClient.post('/token/refresh', null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return response.data;
}

export async function ping(): Promise<{ status: string }> {
    const response = await apiClient.get('/ping');
    return response.data;
}
