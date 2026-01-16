import apiClient from './client';
import type {
    OpenTradeSchema,
    TradeSchema,
    Profit,
    Balances,
    ShowConfig,
    DailyRecord
} from '@/types/api';

// Bot control
export async function startBot(): Promise<{ status: string }> {
    const response = await apiClient.post('/start');
    return response.data;
}

export async function stopBot(): Promise<{ status: string }> {
    const response = await apiClient.post('/stop');
    return response.data;
}

export async function pauseBot(): Promise<{ status: string }> {
    const response = await apiClient.post('/pause');
    return response.data;
}

// Config
export async function getConfig(): Promise<ShowConfig> {
    const response = await apiClient.get('/show_config');
    return response.data;
}

// Trades
export async function getOpenTrades(): Promise<OpenTradeSchema[]> {
    const response = await apiClient.get('/status');
    return response.data;
}

export async function getTrades(limit = 500, offset = 0): Promise<{
    trades: TradeSchema[];
    trades_count: number;
    total_trades: number;
}> {
    const response = await apiClient.get('/trades', { params: { limit, offset } });
    return response.data;
}

export async function getTrade(tradeId: number): Promise<TradeSchema> {
    const response = await apiClient.get(`/trade/${tradeId}`);
    return response.data;
}

export async function forceExit(tradeId: number | string, orderType?: string): Promise<{ result: string }> {
    const response = await apiClient.post('/forceexit', { tradeid: tradeId, ordertype: orderType });
    return response.data;
}

export async function forceEntry(
    pair: string,
    side: 'long' | 'short' = 'long',
    price?: number,
    stakeAmount?: number
): Promise<TradeSchema> {
    const response = await apiClient.post('/forceentry', {
        pair,
        side,
        price,
        stakeamount: stakeAmount
    });
    return response.data;
}

// Balance & Profit
export async function getBalance(): Promise<Balances> {
    const response = await apiClient.get('/balance');
    return response.data;
}

export async function getProfit(): Promise<Profit> {
    const response = await apiClient.get('/profit');
    return response.data;
}

export async function getDaily(days = 7): Promise<{ data: DailyRecord[] }> {
    const response = await apiClient.get('/daily', { params: { timescale: days } });
    return response.data;
}

export async function getWeekly(weeks = 4): Promise<{ data: DailyRecord[] }> {
    const response = await apiClient.get('/weekly', { params: { timescale: weeks } });
    return response.data;
}

// Whitelist/Blacklist
export async function getWhitelist(): Promise<{ whitelist: string[]; length: number }> {
    const response = await apiClient.get('/whitelist');
    return response.data;
}

export async function getBlacklist(): Promise<{ blacklist: string[]; length: number }> {
    const response = await apiClient.get('/blacklist');
    return response.data;
}

export async function addToBlacklist(pairs: string[]): Promise<{ blacklist: string[] }> {
    const response = await apiClient.post('/blacklist', { blacklist: pairs });
    return response.data;
}

// System
export async function getVersion(): Promise<{ version: string }> {
    const response = await apiClient.get('/version');
    return response.data;
}

export async function getSysInfo(): Promise<{ cpu_pct: number[]; ram_pct: number }> {
    const response = await apiClient.get('/sysinfo');
    return response.data;
}

export async function getLogs(limit = 100): Promise<{ logs: string[][] }> {
    const response = await apiClient.get('/logs', { params: { limit } });
    return response.data;
}
