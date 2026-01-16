import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, refreshAccessToken } from '@/api/auth';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref<string | null>(sessionStorage.getItem('access_token'));
    const refreshTokenValue = ref<string | null>(sessionStorage.getItem('refresh_token'));
    const username = ref<string | null>(sessionStorage.getItem('username'));

    const isAuthenticated = computed(() => !!accessToken.value);

    async function login(user: string, password: string): Promise<boolean> {
        try {
            const response = await apiLogin(user, password);
            accessToken.value = response.access_token;
            refreshTokenValue.value = response.refresh_token;
            username.value = user;

            sessionStorage.setItem('access_token', response.access_token);
            sessionStorage.setItem('refresh_token', response.refresh_token);
            sessionStorage.setItem('username', user);

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    async function refreshToken(): Promise<boolean> {
        if (!refreshTokenValue.value) return false;

        try {
            const response = await refreshAccessToken(refreshTokenValue.value);
            accessToken.value = response.access_token;
            sessionStorage.setItem('access_token', response.access_token);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    }

    function logout() {
        accessToken.value = null;
        refreshTokenValue.value = null;
        username.value = null;

        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('username');

        router.push('/login');
    }

    return {
        accessToken,
        username,
        isAuthenticated,
        login,
        refreshToken,
        logout,
    };
});
