'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePortfolios } from '@/hooks/use-portfolios';
import { Portfolio } from '@/types/types';

interface AccountContextValue {
    selectedPortfolioId: string;
    setSelectedPortfolioId: (id: string) => void;
    activePortfolio: Portfolio | undefined;
    portfolios: Portfolio[];
    isLoading: boolean;
    error: Error | null;
}

const AccountContext = createContext<AccountContextValue>({
    selectedPortfolioId: '',
    setSelectedPortfolioId: () => {},
    activePortfolio: undefined,
    portfolios: [],
    isLoading: true,
    error: null,
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
    const { data: portfolios = [], isLoading, error } = usePortfolios();

    // Auto-select first portfolio once data loads
    useEffect(() => {
        if (portfolios.length > 0 && !selectedPortfolioId) {
            setSelectedPortfolioId(portfolios[0].id);
        }
    }, [portfolios, selectedPortfolioId]);

    // Otherwise a failed load is indistinguishable from an empty account list.
    useEffect(() => {
        if (error) toast.error(error.message || 'Could not load your accounts');
    }, [error]);

    const activePortfolio =
        portfolios.find(p => p.id === selectedPortfolioId) ?? portfolios[0];

    return (
        <AccountContext.Provider value={{
            selectedPortfolioId,
            setSelectedPortfolioId,
            activePortfolio,
            portfolios,
            isLoading,
            error,
        }}>
            {children}
        </AccountContext.Provider>
    );
}

export function useAccount() {
    return useContext(AccountContext);
}
