import {
    Portfolio,
    ForexTrade,
    CashTransaction,
    PortfolioStats,
    TradeStats,
} from '@/types/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
        try {
            const url = `${API_URL}${endpoint}`;

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Fetch timeout')), 3000);
            });

            const fetchPromise = fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error((error as { message?: string }).message || `API error: ${response.status}`);
            }

            return response.json();
        } catch {
            // Fallback to mock data for development
            const mockData = this.getMockData(endpoint, options);
            return mockData as T;
        }
    }

    private getMockData(endpoint: string, options?: RequestInit): unknown {
        if (endpoint === '/portfolios' && (!options || options.method !== 'POST')) {
            return MOCK_PORTFOLIOS;
        }
        if (endpoint.match(/^\/portfolios\/[\w-]+$/) && (!options || options.method !== 'PUT' && options.method !== 'DELETE')) {
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
        return {};
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
