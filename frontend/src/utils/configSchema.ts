/**
 * Freqtrade config schema with metadata for wizard generation
 */

export interface ConfigField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'password' | 'textarea' | 'json';
    required?: boolean;
    default?: unknown;
    options?: { label: string; value: string | number }[];
    placeholder?: string;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
    dependsOn?: { field: string; value: unknown }; // Only show if condition met
}

export interface ConfigSection {
    id: string;
    title: string;
    icon: string;
    description?: string;
    fields: ConfigField[];
}

// Supported exchanges
export const EXCHANGES = [
    { label: 'Binance', value: 'binance' },
    { label: 'Kraken', value: 'kraken' },
    { label: 'OKX', value: 'okx' },
    { label: 'Bybit', value: 'bybit' },
    { label: 'Gate.io', value: 'gateio' },
    { label: 'Kucoin', value: 'kucoin' },
];

// Common stake currencies
export const STAKE_CURRENCIES = [
    { label: 'USDT', value: 'USDT' },
    { label: 'BUSD', value: 'BUSD' },
    { label: 'USDC', value: 'USDC' },
    { label: 'BTC', value: 'BTC' },
    { label: 'ETH', value: 'ETH' },
];

// Timeframes
export const TIMEFRAMES = [
    { label: '1分钟', value: '1m' },
    { label: '5分钟', value: '5m' },
    { label: '15分钟', value: '15m' },
    { label: '30分钟', value: '30m' },
    { label: '1小时', value: '1h' },
    { label: '4小时', value: '4h' },
    { label: '1天', value: '1d' },
];

// Config sections definition
export const CONFIG_SECTIONS: ConfigSection[] = [
    {
        id: 'mode',
        title: '运行模式',
        icon: 'Switch',
        description: '选择模拟交易或实盘模式',
        fields: [
            {
                key: 'dry_run',
                label: '模拟模式 (Dry Run)',
                type: 'boolean',
                default: true,
                description: '开启后使用虚拟资金，不进行真实交易',
            },
            {
                key: 'dry_run_wallet',
                label: '模拟资金',
                type: 'number',
                default: 1000,
                min: 100,
                dependsOn: { field: 'dry_run', value: true },
            },
        ],
    },
    {
        id: 'exchange',
        title: '交易所配置',
        icon: 'Connection',
        description: '选择交易所并配置 API',
        fields: [
            {
                key: 'exchange.name',
                label: '交易所',
                type: 'select',
                required: true,
                options: EXCHANGES,
                default: 'binance',
            },
            {
                key: 'exchange.key',
                label: 'API Key',
                type: 'password',
                placeholder: '输入 API Key',
                dependsOn: { field: 'dry_run', value: false },
            },
            {
                key: 'exchange.secret',
                label: 'API Secret',
                type: 'password',
                placeholder: '输入 API Secret',
                dependsOn: { field: 'dry_run', value: false },
            },
        ],
    },
    {
        id: 'trading',
        title: '交易配置',
        icon: 'Money',
        description: '设置交易金额和数量',
        fields: [
            {
                key: 'stake_currency',
                label: '计价货币',
                type: 'select',
                required: true,
                options: STAKE_CURRENCIES,
                default: 'USDT',
            },
            {
                key: 'stake_amount',
                label: '每笔金额',
                type: 'number',
                required: true,
                default: 30,
                min: 1,
                description: '每笔交易投入的金额',
            },
            {
                key: 'max_open_trades',
                label: '最大持仓数',
                type: 'number',
                default: 3,
                min: 1,
                max: 100,
            },
            {
                key: 'timeframe',
                label: '时间周期',
                type: 'select',
                options: TIMEFRAMES,
                default: '5m',
            },
            {
                key: 'trading_mode',
                label: '交易模式',
                type: 'select',
                options: [
                    { label: '现货 (Spot)', value: 'spot' },
                    { label: '杠杆 (Margin)', value: 'margin' },
                    { label: '合约 (Futures)', value: 'futures' },
                ],
                default: 'spot',
            },
        ],
    },
    {
        id: 'strategy',
        title: '策略参数',
        icon: 'TrendCharts',
        description: '止损和止盈设置 (可被策略覆盖)',
        fields: [
            {
                key: 'stoploss',
                label: '止损比例',
                type: 'number',
                default: -0.1,
                min: -1,
                max: 0,
                step: 0.01,
                description: '例如 -0.1 表示亏损 10% 时止损',
            },
            {
                key: 'trailing_stop',
                label: '移动止损',
                type: 'boolean',
                default: false,
            },
            {
                key: 'trailing_stop_positive',
                label: '盈利止损触发点',
                type: 'number',
                default: 0.01,
                step: 0.001,
                dependsOn: { field: 'trailing_stop', value: true },
            },
        ],
    },
    {
        id: 'api_server',
        title: 'API 服务',
        icon: 'Monitor',
        description: '配置 REST API 访问',
        fields: [
            {
                key: 'api_server.enabled',
                label: '启用 API',
                type: 'boolean',
                default: true,
            },
            {
                key: 'api_server.listen_port',
                label: '端口',
                type: 'number',
                default: 8080,
                dependsOn: { field: 'api_server.enabled', value: true },
            },
            {
                key: 'api_server.username',
                label: '用户名',
                type: 'text',
                default: 'freqtrader',
                dependsOn: { field: 'api_server.enabled', value: true },
            },
            {
                key: 'api_server.password',
                label: '密码',
                type: 'password',
                placeholder: '设置 API 访问密码',
                dependsOn: { field: 'api_server.enabled', value: true },
            },
        ],
    },
];

// Generate default config from schema
export function generateDefaultConfig(): Record<string, unknown> {
    const config: Record<string, unknown> = {
        '$schema': 'https://schema.freqtrade.io/schema.json',
        bot_name: 'freqtrade',
        initial_state: 'running',
        force_entry_enable: false,
        internals: {
            process_throttle_secs: 5,
        },
        pairlists: [{ method: 'StaticPairList' }],
        exchange: {
            pair_whitelist: ['BTC/USDT', 'ETH/USDT'],
            pair_blacklist: [],
        },
        minimal_roi: {
            '60': 0.01,
            '30': 0.02,
            '0': 0.04,
        },
        entry_pricing: {
            price_side: 'same',
            use_order_book: true,
            order_book_top: 1,
        },
        exit_pricing: {
            price_side: 'same',
            use_order_book: true,
            order_book_top: 1,
        },
    };

    // Apply defaults from schema
    for (const section of CONFIG_SECTIONS) {
        for (const field of section.fields) {
            if (field.default !== undefined) {
                setNestedValue(config, field.key, field.default);
            }
        }
    }

    return config;
}

// Helper to set nested object values
export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i] as string;
        if (!(key in current)) {
            current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1] as string;
    current[lastKey] = value;
}

// Helper to get nested object values
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return current;
}
