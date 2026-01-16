import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
    add, get, getByIndex, getAllByIndex, put, remove,
    type User, type BotCredential, type BotConfig, initDB
} from '@/utils/storage';
import { generateId, hashPassword, verifyPassword, obfuscate, deobfuscate } from '@/utils/crypto';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
    // State
    const currentUser = ref<User | null>(null);
    const isAuthenticated = computed(() => !!currentUser.value);
    const botCredentials = ref<BotCredential[]>([]);
    const botConfigs = ref<BotConfig[]>([]);
    const activeBotId = ref<string | null>(sessionStorage.getItem('activeBotId'));

    // Initialize DB on store creation
    initDB();

    // User Authentication
    async function register(username: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Check if username exists
            const existing = await getByIndex<User>('users', 'username', username);
            if (existing) {
                return { success: false, error: '用户名已存在' };
            }

            const user: User = {
                id: generateId(),
                username,
                passwordHash: await hashPassword(password),
                createdAt: Date.now(),
            };

            await add('users', user);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: '注册失败' };
        }
    }

    async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            const user = await getByIndex<User>('users', 'username', username);
            if (!user) {
                return { success: false, error: '用户不存在' };
            }

            const valid = await verifyPassword(password, user.passwordHash);
            if (!valid) {
                return { success: false, error: '密码错误' };
            }

            currentUser.value = user;
            sessionStorage.setItem('userId', user.id);

            // Load user's bot credentials and configs
            await loadUserData();

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: '登录失败' };
        }
    }

    function logout() {
        currentUser.value = null;
        botCredentials.value = [];
        botConfigs.value = [];
        activeBotId.value = null;
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('activeBotId');
        router.push('/login');
    }

    async function restoreSession(): Promise<boolean> {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return false;

        try {
            const user = await get<User>('users', userId);
            if (user) {
                currentUser.value = user;
                await loadUserData();
                return true;
            }
        } catch (error) {
            console.error('Restore session error:', error);
        }
        return false;
    }

    // Bot Credentials Management
    async function loadUserData() {
        if (!currentUser.value) return;

        botCredentials.value = await getAllByIndex<BotCredential>('botCredentials', 'userId', currentUser.value.id);
        botConfigs.value = await getAllByIndex<BotConfig>('botConfigs', 'userId', currentUser.value.id);
    }

    async function addBotCredential(name: string, url: string, username: string, password: string): Promise<string> {
        if (!currentUser.value) throw new Error('Not authenticated');

        const credential: BotCredential = {
            id: generateId(),
            userId: currentUser.value.id,
            name,
            url,
            username,
            password: obfuscate(password),
            createdAt: Date.now(),
        };

        await add('botCredentials', credential);
        botCredentials.value.push(credential);
        return credential.id;
    }

    async function updateBotCredential(id: string, updates: Partial<Omit<BotCredential, 'id' | 'userId' | 'createdAt'>>) {
        const index = botCredentials.value.findIndex(c => c.id === id);
        if (index === -1) return;

        const current = botCredentials.value[index]!;
        const updated: BotCredential = {
            id: current.id,
            userId: current.userId,
            createdAt: current.createdAt,
            name: updates.name ?? current.name,
            url: updates.url ?? current.url,
            username: updates.username ?? current.username,
            password: updates.password ? obfuscate(updates.password) : current.password,
            lastConnected: updates.lastConnected ?? current.lastConnected,
        };

        await put('botCredentials', updated);
        botCredentials.value[index] = updated;
    }

    async function deleteBotCredential(id: string) {
        await remove('botCredentials', id);
        botCredentials.value = botCredentials.value.filter(c => c.id !== id);
        if (activeBotId.value === id) {
            activeBotId.value = null;
            sessionStorage.removeItem('activeBotId');
        }
    }

    function getBotPassword(credential: BotCredential): string {
        return deobfuscate(credential.password);
    }

    function setActiveBot(id: string | null) {
        activeBotId.value = id;
        if (id) {
            sessionStorage.setItem('activeBotId', id);
        } else {
            sessionStorage.removeItem('activeBotId');
        }
    }

    const activeBot = computed(() =>
        botCredentials.value.find(c => c.id === activeBotId.value) || null
    );

    // Bot Config Management
    async function addBotConfig(name: string, config: Record<string, unknown>): Promise<string> {
        if (!currentUser.value) throw new Error('Not authenticated');

        const botConfig: BotConfig = {
            id: generateId(),
            userId: currentUser.value.id,
            name,
            config,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await add('botConfigs', botConfig);
        botConfigs.value.push(botConfig);
        return botConfig.id;
    }

    async function updateBotConfig(id: string, name: string, config: Record<string, unknown>) {
        const index = botConfigs.value.findIndex(c => c.id === id);
        if (index === -1) return;

        const current = botConfigs.value[index]!;
        const updated: BotConfig = {
            id: current.id,
            userId: current.userId,
            createdAt: current.createdAt,
            name,
            config,
            updatedAt: Date.now()
        };

        await put('botConfigs', updated);
        botConfigs.value[index] = updated;
    }

    async function deleteBotConfig(id: string) {
        await remove('botConfigs', id);
        botConfigs.value = botConfigs.value.filter(c => c.id !== id);
    }

    function exportConfig(config: BotConfig): string {
        return JSON.stringify(config.config, null, 2);
    }

    function downloadConfig(config: BotConfig) {
        const blob = new Blob([exportConfig(config)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        // State
        currentUser,
        isAuthenticated,
        botCredentials,
        botConfigs,
        activeBotId,
        activeBot,
        // Auth
        register,
        login,
        logout,
        restoreSession,
        // Bot Credentials
        addBotCredential,
        updateBotCredential,
        deleteBotCredential,
        getBotPassword,
        setActiveBot,
        // Bot Configs
        addBotConfig,
        updateBotConfig,
        deleteBotConfig,
        exportConfig,
        downloadConfig,
    };
});
