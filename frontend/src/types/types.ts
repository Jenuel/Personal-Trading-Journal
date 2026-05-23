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

