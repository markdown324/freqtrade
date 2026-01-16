import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
    getOpenTrades,
    getTrades,
    getProfit,
    getBalance,
    getDaily,
    startBot,
    stopBot
} from '@/api/trades';
import type { OpenTradeSchema, TradeSchema, Profit, Balances, DailyRecord } from '@/types/api';

export const useTradeStore = defineStore('trade', () => {
    // State
    const openTrades = ref<OpenTradeSchema[]>([]);
    const closedTrades = ref<TradeSchema[]>([]);
    const profit = ref<Profit | null>(null);
    const balance = ref<Balances | null>(null);
    const dailyProfit = ref<DailyRecord[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Computed
    const openTradesCount = computed(() => openTrades.value.length);
    const totalProfit = computed(() => profit.value?.profit_all_coin ?? 0);
    const totalProfitPercent = computed(() => profit.value?.profit_all_percent ?? 0);
    const winRate = computed(() => profit.value?.winrate ?? 0);
    const totalBalance = computed(() => balance.value?.total ?? 0);

    // Actions
    async function fetchOpenTrades() {
        try {
            openTrades.value = await getOpenTrades();
        } catch (err) {
            console.error('Fetch open trades error:', err);
        }
    }

    async function fetchClosedTrades(limit = 50, offset = 0) {
        try {
            const response = await getTrades(limit, offset);
            closedTrades.value = response.trades.filter(t => !t.is_open);
        } catch (err) {
            console.error('Fetch closed trades error:', err);
        }
    }

    async function fetchProfit() {
        try {
            profit.value = await getProfit();
        } catch (err) {
            console.error('Fetch profit error:', err);
        }
    }

    async function fetchBalance() {
        try {
            balance.value = await getBalance();
        } catch (err) {
            console.error('Fetch balance error:', err);
        }
    }

    async function fetchDailyProfit(days = 7) {
        try {
            const response = await getDaily(days);
            dailyProfit.value = response.data;
        } catch (err) {
            console.error('Fetch daily profit error:', err);
        }
    }

    async function fetchAll() {
        isLoading.value = true;
        error.value = null;

        try {
            await Promise.all([
                fetchOpenTrades(),
                fetchProfit(),
                fetchBalance(),
                fetchDailyProfit(),
            ]);
        } catch (err) {
            error.value = 'Failed to fetch data';
        } finally {
            isLoading.value = false;
        }
    }

    async function start() {
        try {
            await startBot();
            return true;
        } catch (err) {
            console.error('Start bot error:', err);
            return false;
        }
    }

    async function stop() {
        try {
            await stopBot();
            return true;
        } catch (err) {
            console.error('Stop bot error:', err);
            return false;
        }
    }

    return {
        // State
        openTrades,
        closedTrades,
        profit,
        balance,
        dailyProfit,
        isLoading,
        error,
        // Computed
        openTradesCount,
        totalProfit,
        totalProfitPercent,
        winRate,
        totalBalance,
        // Actions
        fetchOpenTrades,
        fetchClosedTrades,
        fetchProfit,
        fetchBalance,
        fetchDailyProfit,
        fetchAll,
        start,
        stop,
    };
});
