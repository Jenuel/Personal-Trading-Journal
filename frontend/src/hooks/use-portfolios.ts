import { useQuery, useMutation, useQueryClient, keepPreviousData, QueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Portfolio, ForexTrade } from '@/types/types';
import { toast } from 'sonner';

/**
 * Everything an account write can invalidate, in one place. ['portfolios'] is
 * included because the sidebar switcher and settings rows read off that list and
 * went stale after every trade write (CRUD-AUDIT F-14). Without a portfolioId,
 * the keys are invalidated by prefix: broader, but never wrong.
 */
function invalidateAccountData(queryClient: QueryClient, portfolioId?: string) {
    const scoped = (key: string) => ({ queryKey: portfolioId ? [key, portfolioId] : [key] });

    queryClient.invalidateQueries(scoped('analytics'));
    queryClient.invalidateQueries(scoped('trades'));
    queryClient.invalidateQueries(scoped('transactions'));
    queryClient.invalidateQueries(scoped('portfolio'));
    queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    queryClient.invalidateQueries({ queryKey: ['analytics', 'summaries'] });
}

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
            queryClient.invalidateQueries({ queryKey: ['analytics', 'summaries'] });
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
            invalidateAccountData(queryClient, variables.id);
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
        onSuccess: (_data, id) => {
            // Drop the dead account rather than refetching a 404 for it.
            queryClient.removeQueries({ queryKey: ['analytics', id] });
            queryClient.removeQueries({ queryKey: ['portfolio', id] });
            queryClient.invalidateQueries({ queryKey: ['portfolios'] });
            queryClient.invalidateQueries({ queryKey: ['analytics', 'summaries'] });
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

/**
 * staleTime overrides the 5-minute global default in providers.tsx: the response
 * carries an ETag, so a revalidation that hits costs a request with no body.
 */
export function useAnalytics(portfolioId: string) {
    return useQuery({
        queryKey: ['analytics', portfolioId],
        queryFn: () => apiClient.getPortfolioAnalytics(portfolioId),
        enabled: !!portfolioId,
        staleTime: 0,
        placeholderData: keepPreviousData,
    });
}

/** One summary per account, so list rows do not fan out into a request each. */
export function useAnalyticsSummaries() {
    return useQuery({
        queryKey: ['analytics', 'summaries'],
        queryFn: () => apiClient.getAnalyticsSummaries(),
        staleTime: 0,
        placeholderData: keepPreviousData,
    });
}

export function useCreateTrade() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof apiClient.createTrade>[0]) =>
            apiClient.createTrade(data),
        onSuccess: (_data, variables) => {
            invalidateAccountData(queryClient, variables.portfolioId);
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
        mutationFn: ({ id, data }: { id: string; data: Partial<ForexTrade> }) =>
            apiClient.updateTrade(id, data),
        // The API echoes the updated row, so the account can be scoped without
        // threading a portfolioId through every caller.
        onSuccess: (data) => {
            invalidateAccountData(queryClient, data?.portfolioId);
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
        onSuccess: (data) => {
            invalidateAccountData(queryClient, data?.trade?.portfolioId);
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
            invalidateAccountData(queryClient, variables.portfolioId);
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
        // DELETE /transactions/:id answers with a message only: no account to
        // scope to.
        onSuccess: () => {
            invalidateAccountData(queryClient);
            toast.success('Transaction deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete transaction');
        },
    });
}
