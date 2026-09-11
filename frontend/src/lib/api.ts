import { getToken } from '@clerk/nextjs';
import {
    Portfolio,
    ForexTrade,
    CashTransaction,
    PortfolioStats,
    TradeStats,
} from '@/types/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Fixtures are an explicit opt-in for working on the UI without a backend —
 * set NEXT_PUBLIC_USE_MOCKS=true. They are never a *fallback*: a request that
 * fails stays failed, so mutations cannot report success they did not earn.
 */
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

const REQUEST_TIMEOUT_MS = 10_000;

/** Carries the HTTP status through to the hooks, so they can tell a 404 from a 500. */
export class ApiError extends Error {
    readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const MOCK_PORTFOLIOS: Portfolio[] = [
    {
        id: '1',
        name: 'IC Markets Live',
        description: 'Primary live account',
        initialBalance: 10000,
        currentBalance: 11240,
        currency: 'USD',
        broker: 'IC Markets',
        accountType: 'LIVE',
        trades: [
            {
                id: 't1',
                portfolioId: '1',
                pair: 'EURUSD',
                direction: 'LONG',
                lots: 0.5,
                entryPrice: 1.0845,
                exitPrice: 1.0912,
                stopLoss: 1.0810,
                takeProfit: 1.0920,
                pips: 67,
                result: 335,
                rr: 1.91,
                outcome: 'WIN',
                session: 'LONDON',
                setup: 'Break & Retest',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Clean break above H4 resistance. Entered on 15m retest.',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 't2',
                portfolioId: '1',
                pair: 'GBPJPY',
                direction: 'SHORT',
                lots: 0.3,
                entryPrice: 189.45,
                exitPrice: 190.12,
                stopLoss: 189.90,
                takeProfit: 188.60,
                pips: -67,
                result: -201,
                rr: -1.49,
                outcome: 'LOSS',
                session: 'TOKYO',
                setup: 'ICT Order Block',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'SL hit during Asian session spike.',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 't3',
                portfolioId: '1',
                pair: 'XAUUSD',
                direction: 'LONG',
                lots: 0.1,
                entryPrice: 2310.50,
                exitPrice: 2328.75,
                stopLoss: 2302.00,
                takeProfit: 2335.00,
                pips: 182.5,
                result: 182.5,
                rr: 2.18,
                outcome: 'WIN',
                session: 'NEW_YORK',
                setup: 'Demand Zone Bounce',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Perfect bounce off daily demand zone. NY open momentum.',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        cashTransactions: [],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'FTMO Challenge',
        description: '100k prop firm challenge',
        initialBalance: 100000,
        currentBalance: 102450,
        currency: 'USD',
        broker: 'FTMO',
        accountType: 'PROP',
        trades: [
            {
                id: 't4',
                portfolioId: '2',
                pair: 'GBPUSD',
                direction: 'LONG',
                lots: 1.0,
                entryPrice: 1.2645,
                exitPrice: 1.2645,
                stopLoss: 1.2610,
                takeProfit: 1.2680,
                pips: 0,
                result: 0,
                rr: 0,
                outcome: 'BE',
                session: 'LONDON',
                setup: 'London Open Grab',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Moved to BE after hitting 1:1.',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        cashTransactions: [],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

class ApiClient {
    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const method = options?.method ?? 'GET';

        // Reads can be served from fixtures, and only when mocks are switched on
        // explicitly. Writes never are — there is no honest fixture for "saved".
        if (USE_MOCKS && method === 'GET') {
            return this.getMockData(endpoint) as T;
        }

        const url = `${API_URL}${endpoint}`;

        // Clerk session token, so the backend can identify the caller.
        // Null on the server or before sign-in; the request still goes out.
        const token = await getToken().catch(() => null);

        let response: Response;
        try {
            response = await fetch(url, {
                ...options,
                // Replaces the old un-cleared setTimeout race, which leaked a timer
                // per request and reported anything slower than 3s as a failure.
                signal: options?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...options?.headers,
                },
            });
        } catch (cause) {
            // Transport-level failure: the request never got an answer.
            const timedOut = cause instanceof DOMException && cause.name === 'TimeoutError';
            throw new ApiError(
                timedOut
                    ? `${method} ${endpoint} timed out after ${REQUEST_TIMEOUT_MS / 1000}s.`
                    : `Could not reach the API at ${API_URL}. Is the backend running?`
            );
        }

        if (!response.ok) {
            const body = await response.json().catch(() => ({})) as { message?: string; error?: string };
            throw new ApiError(
                body.message || body.error || `API error: ${response.status} ${response.statusText}`,
                response.status
            );
        }

        return this.parseBody<T>(response);
    }

    /** 204s and empty bodies are valid successes; `response.json()` alone would throw on them. */
    private async parseBody<T>(response: Response): Promise<T> {
        if (response.status === 204) return undefined as T;

        const text = await response.text();
        if (!text) return undefined as T;

        try {
            return JSON.parse(text) as T;
        } catch {
            throw new ApiError('The API returned a response that was not valid JSON.', response.status);
        }
    }

    /** Only ever reached for GETs, and only with NEXT_PUBLIC_USE_MOCKS=true. */
    private getMockData(endpoint: string): unknown {
        if (endpoint === '/portfolios') {
            return MOCK_PORTFOLIOS;
        }
        if (endpoint.match(/^\/portfolios\/[\w-]+$/)) {
            const id = endpoint.split('/')[2];
            return MOCK_PORTFOLIOS.find(p => p.id === id) || MOCK_PORTFOLIOS[0];
        }
        if (endpoint.includes('/trades')) {
            // /trades/port/:id  → filter by portfolio
            const portMatch = endpoint.match(/\/trades\/port\/([\w-]+)/);
            if (portMatch) {
                const pid = portMatch[1];
                const portfolio = MOCK_PORTFOLIOS.find(p => p.id === pid);
                return portfolio?.trades ?? [];
            }
            // /trades?portfolioId=:id → filter by query param
            const qpMatch = endpoint.match(/[?&]portfolioId=([\w-]+)/);
            if (qpMatch) {
                const pid = qpMatch[1];
                const portfolio = MOCK_PORTFOLIOS.find(p => p.id === pid);
                return portfolio?.trades ?? [];
            }
            // /trades (no filter) → all trades
            return MOCK_PORTFOLIOS.flatMap(p => p.trades || []);
        }
        if (endpoint.includes('/transactions')) {
            return MOCK_PORTFOLIOS.flatMap(p => p.cashTransactions || []);
        }
        if (endpoint.includes('/stats')) {
            return {
                totalValue: 11240,
                totalGain: 1240,
                totalGainPercent: 12.4,
                realizedGain: 1240,
                unrealizedGain: 0,
                availableCash: 11240,
                winRate: 66.7,
                profitFactor: 2.58,
                avgRR: 1.8,
                totalTrades: 3,
                winCount: 2,
                lossCount: 1,
                beCount: 0,
            } as PortfolioStats;
        }
        throw new ApiError(`No mock fixture for GET ${endpoint}. Unset NEXT_PUBLIC_USE_MOCKS to use the real API.`);
    }

    async getPortfolios(): Promise<Portfolio[]> {
        return this.request('/portfolios');
    }

    async getPortfolio(id: string): Promise<Portfolio> {
        return this.request(`/portfolios/${id}`);
    }

    async createPortfolio(data: {
        name: string;
        description?: string;
        initialBalance: number;
        currency: string;
        broker?: string;
        accountType: string;
    }): Promise<Portfolio> {
        return this.request('/portfolios', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updatePortfolio(
        id: string,
        data: Partial<Portfolio>
    ): Promise<Portfolio> {
        return this.request(`/portfolios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deletePortfolio(id: string): Promise<void> {
        return this.request(`/portfolios/${id}`, { method: 'DELETE' });
    }

    async getTrades(portfolioId?: string): Promise<ForexTrade[]> {
        const params = portfolioId ? `?portfolioId=${portfolioId}` : '';
        return this.request(`/trades${params}`);
    }

    async getPortfolioTrades(portfolioId: string): Promise<ForexTrade[]> {
        return this.request(`/trades/port/${portfolioId}`);
    }

    async createTrade(data: {
        portfolioId: string;
        pair: string;
        direction: 'LONG' | 'SHORT';
        lots: number;
        entryPrice: number;
        exitPrice?: number;
        stopLoss?: number;
        takeProfit?: number;
        pips?: number;
        result?: number;
        rr?: number;
        outcome?: 'WIN' | 'LOSS' | 'BE';
        session?: string;
        setup?: string;
        date: string;
        notes?: string;
    }): Promise<ForexTrade> {
        return this.request('/trades', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTrade(id: string, data: Partial<ForexTrade>): Promise<ForexTrade> {
        return this.request(`/trades/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTrade(id: string): Promise<void> {
        return this.request(`/trades/${id}`, { method: 'DELETE' });
    }

    async getCashTransactions(portfolioId?: string): Promise<CashTransaction[]> {
        const params = portfolioId ? `?portfolioId=${portfolioId}` : '';
        return this.request(`/transactions${params}`);
    }

    async createCashTransaction(data: {
        portfolioId: string;
        type: 'DEPOSIT' | 'WITHDRAWAL';
        amount: number;
        date: string;
        notes?: string;
    }): Promise<CashTransaction> {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteCashTransaction(id: string): Promise<void> {
        return this.request(`/transactions/${id}`, { method: 'DELETE' });
    }

    async getPortfolioStats(portfolioId: string): Promise<PortfolioStats> {
        return this.request(`/portfolios/${portfolioId}/stats`);
    }

    async getTradeStats(portfolioId?: string): Promise<TradeStats> {
        const params = portfolioId ? `?portfolioId=${portfolioId}` : '';
        return this.request(`/stats${params}`);
    }
}

export const apiClient = new ApiClient();
