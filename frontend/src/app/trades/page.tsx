'use client';

import { useState, useMemo } from 'react';
import { TradesTable } from '@/components/trades-table';
import { TradeDialog } from '@/components/trade-dialog';
import {
    usePortfolios,
    useCreateTrade,
    useDeleteTrade,
} from '@/hooks/use-portfolios';
import { Button } from '@/components/ui/button';
import { Plus, ScrollText } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function TradesPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('all');

    const { data: portfolios, isLoading } = usePortfolios();
    const createTrade = useCreateTrade();
    const deleteTrade = useDeleteTrade();

    const allTrades = useMemo(() => {
        if (!portfolios) return [];
        if (selectedPortfolioId === 'all') {
            return portfolios
                .flatMap(p => p.trades ?? [])
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        const p = portfolios.find(p => p.id === selectedPortfolioId);
        return (p?.trades ?? []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [portfolios, selectedPortfolioId]);

    const activePortfolio = useMemo(() => {
        if (!portfolios || selectedPortfolioId === 'all') return portfolios?.[0];
        return portfolios.find(p => p.id === selectedPortfolioId);
    }, [portfolios, selectedPortfolioId]);

    if (isLoading) {
        return (
            <div className="page-container space-y-6">
                <div className="h-8 w-40 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />
                <div className="h-64 rounded-xl animate-pulse" style={{ background: 'var(--muted)' }} />
            </div>
        );
    }

    return (
        <div className="page-container space-y-8">
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ScrollText size={16} style={{ color: 'var(--fx-accent)' }} />
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fx-accent)', letterSpacing: '0.12em' }}>
                            Journal
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                        Trade Log
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {allTrades.length} trade{allTrades.length !== 1 ? 's' : ''} logged
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {portfolios && portfolios.length > 1 && (
                        <Select
                            value={selectedPortfolioId}
                            onValueChange={setSelectedPortfolioId}
                        >
                            <SelectTrigger
                                className="w-44 text-sm"
                                style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                            >
                                <SelectValue placeholder="All accounts" />
                            </SelectTrigger>
                            <SelectContent style={{ background: 'var(--popover)', borderColor: 'var(--border)' }}>
                                <SelectItem value="all">All Accounts</SelectItem>
                                {portfolios.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Button
                        onClick={() => setDialogOpen(true)}
                        disabled={!activePortfolio}
                        className="btn-fx"
                        style={{ border: 'none', gap: '6px' }}
                    >
                        <Plus size={16} />
                        Log Trade
                    </Button>
                </div>
            </div>

            <div className="animate-slide-up stagger-1">
                <TradesTable
                    trades={allTrades}
                    onDelete={(id) => deleteTrade.mutate(id)}
                    isDeleting={deleteTrade.isPending}
                    currency={activePortfolio?.currency}
                />
            </div>

            {activePortfolio && (
                <TradeDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    portfolioId={activePortfolio.id}
                    onSubmit={(data) => createTrade.mutate(data)}
                    isLoading={createTrade.isPending}
                />
            )}
        </div>
    );
}
