export type FxSession = 'LONDON' | 'NEW_YORK' | 'TOKYO' | 'SYDNEY' | 'OVERLAP';
export type TradeDirection = 'LONG' | 'SHORT';
export type TradeOutcome = 'WIN' | 'LOSS' | 'BE';
export type AccountType = 'LIVE' | 'DEMO' | 'PROP';
export type AccountCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'NZD';

export const MAJOR_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'] as const;
export const MINOR_PAIRS = ['EURGBP', 'EURJPY', 'GBPJPY', 'EURAUD', 'EURCAD', 'GBPAUD', 'GBPCAD', 'AUDCAD', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'EURNZD', 'GBPNZD', 'AUDNZD', 'GBPCHF', 'EURCHF', 'AUDCHF', 'CADCHF', 'NZDCAD', 'NZDCHF'] as const;
export const EXOTIC_PAIRS = ['USDZAR', 'USDMXN', 'USDTRY', 'USDHKD', 'USDSGD', 'USDDKK', 'USDNOK', 'USDSEK', 'USDPLN', 'USDCZK', 'USDHUF', 'XAUUSD', 'XAGUSD'] as const;

export type FxPair = typeof MAJOR_PAIRS[number] | typeof MINOR_PAIRS[number] | typeof EXOTIC_PAIRS[number] | string;

export interface Portfolio {
    id: string;
    name: string;
    description?: string;
    initialBalance: number;
    currentBalance: number;
    currency: AccountCurrency;
    broker?: string;
    accountType: AccountType;
    trades?: ForexTrade[];
    cashTransactions?: CashTransaction[];
    createdAt: string;
    updatedAt: string;
}

export interface ForexTrade {
    id: string;
    portfolioId: string;

    pair: FxPair;
    direction: TradeDirection;
    lots: number;

    entryPrice: number;
    exitPrice?: number;              // undefined = still open
    stopLoss?: number;
    takeProfit?: number;

    pips?: number;
    result?: number;                 // P&L in account currency
    rr?: number;
    outcome?: TradeOutcome;

    session?: FxSession;
    setup?: string;

    date: string;
    notes?: string;
    createdAt: string;
}

export interface CashTransaction {
    id: string;
    portfolioId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    date: string;
    notes?: string;
    createdAt: string;
}

export interface PortfolioStats {
    totalValue: number;
    totalGain: number;
    totalGainPercent: number;
    realizedGain: number;
    unrealizedGain: number;
    availableCash: number;
    winRate: number;
    profitFactor: number;
    avgRR: number;
    totalTrades: number;
    winCount: number;
    lossCount: number;
    beCount: number;
}

export interface TradeStats {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    avgRR: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    totalPips: number;
    bestPair: string;
    worstPair: string;
    bestSession: FxSession | null;
}
