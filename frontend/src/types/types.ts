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

// ─── Analytics ───────────────────────────────────────────────────────────────
// Computed by the backend and never in the browser: GET /portfolios/:id/analytics
// is the single source of truth for every figure below. Every aggregate covers
// CLOSED trades only; open positions are reported as a count and nothing else.

/**
 * Infinity has no JSON representation — JSON.stringify turns it into null, which
 * would be indistinguishable from "not computable". The API sends the string
 * instead, so an account with winners and no losers is unambiguous.
 */
export type ProfitFactor = number | 'Infinity';

export interface AnalyticsSummary {
    totalTrades: number;
    closedTrades: number;
    openTrades: number;
    winCount: number;
    lossCount: number;
    beCount: number;
    winRate: number;                 // percent 0-100, closed-trade denominator
    totalPL: number;
    totalPips: number;
    grossProfit: number;
    grossLoss: number;
    profitFactor: ProfitFactor;
    avgRR: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    bestPair: string | null;
    worstPair: string | null;        // null when only one pair was traded
    bestSession: FxSession | null;
}

export interface EquityPoint {
    date: string | null;             // null on the synthetic opening balance point
    balance: number;
    pl: number;
}

export interface PairPerformance {
    pair: string;
    pl: number;
    count: number;
    wins: number;
    winRate: number;
}

export interface SessionPerformance {
    session: FxSession | 'OTHER';    // OTHER buckets trades with no session set
    pl: number;
    count: number;
    wins: number;
    winRate: number;
}

export interface MonthlyPerformance {
    month: string;                   // YYYY-MM
    pl: number;
    count: number;
}

export interface PortfolioAnalytics {
    portfolioId: string;
    generatedAt: string;
    version: string;                 // the account's updated_at, the cache stamp
    currency: AccountCurrency;
    initialBalance: number;
    currentBalance: number;
    summary: AnalyticsSummary;
    equityCurve: EquityPoint[];
    byPair: PairPerformance[];       // sorted by pl desc
    bySession: SessionPerformance[]; // sorted by winRate desc
    monthly: MonthlyPerformance[];   // every month, ascending
}

export interface AccountAnalyticsSummary {
    portfolioId: string;
    version: string;
    summary: AnalyticsSummary;
}
