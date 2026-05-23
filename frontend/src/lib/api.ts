import {
    Portfolio,
    Trade,
    CashTransaction,
    PortfolioStats,
} from '@/types/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Mock data for development when backend is unavailable
const MOCK_PORTFOLIOS: Portfolio[] = [
    {
        id: '1',
        name: 'Main Portfolio',
        description: 'Primary trading account',
        initialBalance: 10000,
        currentBalance: 12500,
        trades: [
            {
                id: 't1',
                portfolioId: '1',
                symbol: 'AAPL',
                type: 'BUY',
                quantity: 10,
                price: 150,
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Initial buy',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 't2',
                portfolioId: '1',
                symbol: 'AAPL',
                type: 'SELL',
                quantity: 5,
                price: 160,
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Partial profit take',
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 't3',
                portfolioId: '1',
                symbol: 'MSFT',
                type: 'BUY',
                quantity: 8,
                price: 350,
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                notes: '',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        cashTransactions: [
            {
                id: 'c1',
                portfolioId: '1',
                type: 'DEPOSIT',
                amount: 5000,
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Initial deposit',
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Options Account',
        description: 'Short-term trading',
        initialBalance: 5000,
        currentBalance: 4800,
        trades: [
            {
                id: 't4',
                portfolioId: '2',
                symbol: 'SPY',
                type: 'BUY',
                quantity: 20,
                price: 450,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                notes: '',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        cashTransactions: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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

            // Fetch with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Fetch timeout')), 2000);
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
                throw new Error(error.message || `API error: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            // Fallback to mock data for development
            const mockData = this.getMockData(endpoint, options);
            return mockData as T;
        }
    }

    private getMockData(endpoint: string, options?: RequestInit): unknown {
        // Handle different endpoints
        if (endpoint === '/portfolios' && (!options || options.method !== 'POST')) {
            return MOCK_PORTFOLIOS;
        }
        if (endpoint.match(/^\/portfolios\/\d+$/) && (!options || options.method !== 'PUT')) {
            const id = endpoint.split('/')[2];
            return MOCK_PORTFOLIOS.find(p => p.id === id) || MOCK_PORTFOLIOS[0];
        }
        if (endpoint.includes('/trades')) {
            const trades = MOCK_PORTFOLIOS.flatMap(p => p.trades || []);
            return trades;
        }
        if (endpoint.includes('/transactions')) {
            const transactions = MOCK_PORTFOLIOS.flatMap(p => p.cashTransactions || []);
            return transactions;
        }
        if (endpoint.includes('/stats')) {
            const portfolio = MOCK_PORTFOLIOS[0];
            return {
                totalInvested: portfolio.initialBalance,
                totalValue: portfolio.currentBalance,
                realizedPL: 2500,
                unrealizedPL: 0,
                winRate: 50,
            };
        }
        return {};
    }

    // Portfolio endpoints
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

    // Trade endpoints
    async getTrades(portfolioId?: string): Promise<Trade[]> {
        const params = portfolioId ? `?portfolioId=${portfolioId}` : '';
        return this.request(`/trades${params}`);
    }

    async getPortfolioTrades(portfolioId: string): Promise<Trade[]> {
        return this.request(`/trades?portfolioId=${portfolioId}`);
    }

    async createTrade(data: {
        portfolioId: string;
        type: 'BUY' | 'SELL';
        symbol: string;
        quantity: number;
        price: number;
        date: string;
        notes?: string;
    }): Promise<Trade> {
        return this.request('/trades', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTrade(id: string, data: Partial<Trade>): Promise<Trade> {
        return this.request(`/trades/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTrade(id: string): Promise<void> {
        return this.request(`/trades/${id}`, { method: 'DELETE' });
    }

    // Cash transaction endpoints
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

    // Portfolio stats endpoint
    async getPortfolioStats(portfolioId: string): Promise<PortfolioStats> {
        return this.request(`/portfolios/${portfolioId}/stats`);
    }
}

export const apiClient = new ApiClient();
