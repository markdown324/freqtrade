// API type definitions based on freqtrade API schemas

export interface Balance {
  currency: string;
  free: number;
  balance: number;
  used: number;
  bot_owned?: number;
  est_stake: number;
  est_stake_bot?: number;
  stake: string;
  side: string;
  is_position: boolean;
  position: number;
  is_bot_managed: boolean;
}

export interface Balances {
  currencies: Balance[];
  total: number;
  total_bot: number;
  symbol: string;
  value: number;
  value_bot: number;
  stake: string;
  starting_capital: number;
  starting_capital_ratio: number;
  starting_capital_pct: number;
}

export interface TradeSchema {
  trade_id: number;
  pair: string;
  base_currency: string;
  quote_currency: string;
  is_open: boolean;
  is_short: boolean;
  exchange: string;
  amount: number;
  stake_amount: number;
  strategy: string;
  enter_tag?: string;
  timeframe: number;
  open_date: string;
  open_timestamp: number;
  open_rate: number;
  close_date?: string;
  close_timestamp?: number;
  close_rate?: number;
  close_profit?: number;
  close_profit_pct?: number;
  close_profit_abs?: number;
  profit_ratio?: number;
  profit_pct?: number;
  profit_abs?: number;
  exit_reason?: string;
  stop_loss_abs?: number;
  stop_loss_pct?: number;
  leverage?: number;
  trading_mode?: string;
}

export interface OpenTradeSchema extends TradeSchema {
  current_rate: number;
  total_profit_abs: number;
  total_profit_ratio?: number;
  stoploss_current_dist?: number;
  stoploss_current_dist_pct?: number;
}

export interface Profit {
  profit_closed_coin: number;
  profit_closed_percent: number;
  profit_closed_fiat: number;
  profit_all_coin: number;
  profit_all_percent: number;
  profit_all_fiat: number;
  trade_count: number;
  closed_trade_count: number;
  winning_trades: number;
  losing_trades: number;
  winrate: number;
  best_pair: string;
  best_rate: number;
  max_drawdown: number;
  max_drawdown_abs: number;
}

export interface DailyRecord {
  date: string;
  abs_profit: number;
  rel_profit: number;
  starting_balance: number;
  fiat_value: number;
  trade_count: number;
}

export interface ShowConfig {
  version: string;
  dry_run: boolean;
  trading_mode: string;
  stake_currency: string;
  stake_amount: string;
  max_open_trades: number;
  exchange: string;
  strategy?: string;
  bot_name: string;
  state: string;
  runmode: string;
}

export interface BacktestRequest {
  strategy: string;
  timeframe?: string;
  timerange?: string;
  max_open_trades?: number;
  stake_amount?: string | number;
  enable_protections: boolean;
  dry_run_wallet?: number;
}

export interface BacktestResponse {
  status: string;
  running: boolean;
  status_msg: string;
  step: string;
  progress: number;
  trade_count?: number;
  backtest_result?: Record<string, unknown>;
}

export interface PairHistoryRequest {
  pair: string;
  timeframe: string;
  limit?: number;
  columns?: string[];
}

export interface DownloadDataPayload {
  pairs: string[];
  timeframes?: string[];
  days?: number;
  timerange?: string;
  exchange?: string;
}

// WebSocket message types
export type WSMessageType = 
  | 'status'
  | 'trade_update'
  | 'analyzed_df'
  | 'new_candle'
  | 'whitelist'
  | 'entry_fill'
  | 'exit_fill';

export interface WSMessage {
  type: WSMessageType;
  data: unknown;
}

// Theme
export type Theme = 'dark' | 'light';

// Trading mode
export type TradingMode = 'dry_run' | 'live';
