import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Portfolio, Trade, CashTransaction } from '@/types/types';
import { toast } from 'sonner';

export function usePortfolios() {
    return useQuery({
        queryKey: ['portfolios'],
        queryFn: () => apiClient.getPortfolios(),
        retry: 1,
    });
}

export function usePortfolio(id: string) {
    return useQuery({
        queryKey: ['portfolio', id],
        queryFn: () => apiClient.getPortfolio(id),
        enabled: !!id,
    });
}

export function useCreatePortfolio() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof apiClient.createPortfolio>[0]) =>
            apiClient.createPortfolio(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolios'] });
            toast.success('Portfolio created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create portfolio');
        },
    });
}

export function useUpdatePortfolio() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Portfolio> }) =>
            apiClient.updatePortfolio(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['portfolio', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['portfolios'] });
            toast.success('Portfolio updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update portfolio');
        },
    });
}

export function useDeletePortfolio() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.deletePortfolio(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolios'] });
            toast.success('Portfolio deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete portfolio');
        },
    });
}

export function usePortfolioTrades(portfolioId: string) {
    return useQuery({
        queryKey: ['trades', portfolioId],
        queryFn: () => apiClient.getPortfolioTrades(portfolioId),
        enabled: !!portfolioId,
    });
}

export function useCreateTrade() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof apiClient.createTrade>[0]) =>
            apiClient.createTrade(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['trades', variables.portfolioId] });
            queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
            toast.success('Trade created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create trade');
        },
    });
}

export function useUpdateTrade() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Trade> }) =>
            apiClient.updateTrade(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            toast.success('Trade updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update trade');
        },
    });
}

export function useDeleteTrade() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.deleteTrade(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            toast.success('Trade deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete trade');
        },
    });
}

export function useCashTransactions(portfolioId: string) {
    return useQuery({
        queryKey: ['transactions', portfolioId],
        queryFn: () => apiClient.getCashTransactions(portfolioId),
        enabled: !!portfolioId,
    });
}

export function useCreateCashTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof apiClient.createCashTransaction>[0]) =>
            apiClient.createCashTransaction(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.portfolioId] });
            queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
            toast.success('Transaction created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create transaction');
        },
    });
}

export function useDeleteCashTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.deleteCashTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            toast.success('Transaction deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete transaction');
        },
    });
}
