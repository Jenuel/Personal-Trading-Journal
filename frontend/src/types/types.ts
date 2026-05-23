export interface Portfolio {
    id: string;
    name: string;
    description?: string;
    initialBalance: number;
    currentBalance: number;
    trades?: Trade[];
    cashTransactions?: CashTransaction[];
    createdAt: string;
    updatedAt: string;
}

export interface Trade {
    id: string;
    portfolioId: string;
    type: 'BUY' | 'SELL';
    symbol: string;
    quantity: number;
    price: number;
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
}

export interface Position {
    symbol: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
}

export interface TradeDetail extends Trade {
    realizedPL?: number;
    realizedPLPercent?: number;
}
