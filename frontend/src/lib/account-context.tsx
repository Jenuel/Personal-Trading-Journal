'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePortfolios } from '@/hooks/use-portfolios';
import { Portfolio } from '@/types/types';

interface AccountContextValue {
    selectedPortfolioId: string;
    setSelectedPortfolioId: (id: string) => void;
    activePortfolio: Portfolio | undefined;
    portfolios: Portfolio[];
    isLoading: boolean;
}

const AccountContext = createContext<AccountContextValue>({
    selectedPortfolioId: '',
    setSelectedPortfolioId: () => {},
    activePortfolio: undefined,
    portfolios: [],
    isLoading: true,
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
    const { data: portfolios = [], isLoading } = usePortfolios();

    // Auto-select first portfolio once data loads
    useEffect(() => {
        if (portfolios.length > 0 && !selectedPortfolioId) {
            setSelectedPortfolioId(portfolios[0].id);
        }
    }, [portfolios, selectedPortfolioId]);

    const activePortfolio =
        portfolios.find(p => p.id === selectedPortfolioId) ?? portfolios[0];

    return (
        <AccountContext.Provider value={{
            selectedPortfolioId,
            setSelectedPortfolioId,
            activePortfolio,
            portfolios,
            isLoading,
        }}>
            {children}
        </AccountContext.Provider>
    );
}

export function useAccount() {
    return useContext(AccountContext);
}
