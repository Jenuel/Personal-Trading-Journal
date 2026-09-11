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
    const [requestedPortfolioId, setRequestedPortfolioId] = useState<string>('');
    const { data: portfolios = [], isLoading, error } = usePortfolios();

    // Derived, not stored: an id that no longer resolves — nothing picked yet, or
    // the account was deleted — falls back to the first. Auto-selecting in an
    // effect let the stored id and the rendered account disagree (CRUD-AUDIT F-12).
    const activePortfolio =
        portfolios.find(p => p.id === requestedPortfolioId) ?? portfolios[0];
    const selectedPortfolioId = activePortfolio?.id ?? '';

    // Otherwise a failed load is indistinguishable from an empty account list.
    useEffect(() => {
        if (error) toast.error(error.message || 'Could not load your accounts');
    }, [error]);

    return (
        <AccountContext.Provider value={{
            selectedPortfolioId,
            setSelectedPortfolioId: setRequestedPortfolioId,
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
