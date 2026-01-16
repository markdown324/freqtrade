import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getConfig } from '@/api/trades';
import type { ShowConfig, Theme, TradingMode } from '@/types/api';

export const useConfigStore = defineStore('config', () => {
    const config = ref<ShowConfig | null>(null);
    const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'dark');
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Computed
    const isDryRun = computed(() => config.value?.dry_run ?? true);
    const tradingMode = computed<TradingMode>(() => isDryRun.value ? 'dry_run' : 'live');
    const botName = computed(() => config.value?.bot_name ?? 'Freqtrade');
    const exchange = computed(() => config.value?.exchange ?? '');
    const strategy = computed(() => config.value?.strategy ?? '');
    const stakeCurrency = computed(() => config.value?.stake_currency ?? 'USDT');
    const botState = computed(() => config.value?.state ?? 'stopped');

    async function fetchConfig() {
        isLoading.value = true;
        error.value = null;

        try {
            config.value = await getConfig();
        } catch (err) {
            error.value = 'Failed to fetch config';
            console.error('Fetch config error:', err);
        } finally {
            isLoading.value = false;
        }
    }

    function setTheme(newTheme: Theme) {
        theme.value = newTheme;
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    function toggleTheme() {
        setTheme(theme.value === 'dark' ? 'light' : 'dark');
    }

    // Initialize theme on store creation
    function initTheme() {
        document.documentElement.setAttribute('data-theme', theme.value);
    }

    return {
        config,
        theme,
        isLoading,
        error,
        isDryRun,
        tradingMode,
        botName,
        exchange,
        strategy,
        stakeCurrency,
        botState,
        fetchConfig,
        setTheme,
        toggleTheme,
        initTheme,
    };
});
