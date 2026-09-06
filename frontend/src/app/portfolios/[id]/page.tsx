'use client';

import { useState } from 'react';
import { ForexTrade } from '@/types/types';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatsCard } from '@/components/stats-card';
import { TradesTable } from '@/components/trades-table';
import { TradeDialog } from '@/components/trade-dialog';
import {
    usePortfolio,
    usePortfolioTrades,
    useCreateTrade,
    useUpdateTrade,
    useDeleteTrade,
} from '@/hooks/use-portfolios';
import {
    formatCurrency,
    formatPercent,
    calculatePortfolioGain,
    calculateFxStats,
} from '@/lib/portfolio-utils';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Plus,
    Wallet,
    Target,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Layers,
} from 'lucide-react';

const ACCOUNT_TYPE_BADGE: Record<string, { bg: string; color: string }> = {
    LIVE:  { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
    DEMO:  { bg: 'rgba(122,154,184,0.12)', color: '#7a9ab8' },
    PROP:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
};

export default function PortfolioPage() {
    const params = useParams();
    const portfolioId = params.id as string;
    const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState<ForexTrade | undefined>();

    const { data: portfolio, isLoading } = usePortfolio(portfolioId);
    const { data: trades } = usePortfolioTrades(portfolioId);

    const createTrade = useCreateTrade();
    const updateTrade = useUpdateTrade();
    const deleteTrade = useDeleteTrade();

    const handleOpenEdit = (trade: ForexTrade) => {
        setEditingTrade(trade);
        setTradeDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setTradeDialogOpen(open);
        if (!open) setEditingTrade(undefined);
    };

    if (isLoading) {
        return (
            <div className="page-container space-y-8">
                <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: '#0d1524' }} />
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#0d1524' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!portfolio) {
        return (
            <div className="page-container">
                <div className="rounded-xl p-8 text-center" style={{ background: '#0d1524' }}>
                    <p style={{ color: '#4a6080' }}>Account not found.</p>
                    <Link href="/portfolios" className="mt-4 inline-block text-sm" style={{ color: '#7aA8cc' }}>
                        ← Back to Accounts
                    </Link>
                </div>
            </div>
        );
    }

    const { gain, gainPercent } = calculatePortfolioGain(portfolio);
    const allTrades = trades ?? portfolio.trades ?? [];
    const stats = calculateFxStats(allTrades);
    const typeStyle = ACCOUNT_TYPE_BADGE[portfolio.accountType] || ACCOUNT_TYPE_BADGE.DEMO;
    const isProfit = gain >= 0;

    return (
        <div className="page-container space-y-8">

            <div className="animate-slide-up">
                <Link
                    href="/portfolios"
                    className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 transition-colors"
                    style={{ color: '#4a6080' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#7aA8cc')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4a6080')}
                >
                    <ArrowLeft size={13} />
                    Trading Accounts
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="text-xs font-bold px-2 py-0.5 rounded"
                                style={{ background: typeStyle.bg, color: typeStyle.color }}
                            >
                                {portfolio.accountType}
                            </span>
                            <span className="text-xs" style={{ color: '#4a6080' }}>
                                {portfolio.currency}
                            </span>
                            {portfolio.broker && (
                                <span className="text-xs" style={{ color: '#4a6080' }}>
                                    · {portfolio.broker}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold" style={{ color: '#c8ddef', letterSpacing: '-0.02em' }}>
                            {portfolio.name}
                        </h1>
                        {portfolio.description && (
                            <p className="mt-1 text-sm" style={{ color: '#4a6080' }}>
                                {portfolio.description}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={() => setTradeDialogOpen(true)}
                        className="btn-fx"
                        style={{ border: 'none', gap: '6px', flexShrink: 0, marginLeft: '16px' }}
                    >
                        <Plus size={16} />
                        Log Trade
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    label="Balance"
                    value={formatCurrency(portfolio.currentBalance, portfolio.currency)}
                    subtext={`Initial: ${formatCurrency(portfolio.initialBalance, portfolio.currency)}`}
                    icon={<Wallet size={16} />}
                    accentColor="var(--fx-accent)"
                    className="stagger-1"
                />
                <StatsCard
                    label="Total P&L"
                    value={`${isProfit ? '+' : ''}${formatCurrency(gain, portfolio.currency)}`}
                    change={formatPercent(gainPercent)}
                    changeType={isProfit ? 'positive' : 'negative'}
                    icon={isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    accentColor={isProfit ? 'var(--fx-profit)' : 'var(--fx-loss)'}
                    className="stagger-2"
                />
                <StatsCard
                    label="Win Rate"
                    value={`${stats.winRate.toFixed(1)}%`}
                    subtext={`${stats.winCount}W · ${stats.lossCount}L · ${stats.beCount}BE`}
                    icon={<Target size={16} />}
                    accentColor={stats.winRate >= 50 ? 'var(--fx-profit)' : 'var(--fx-loss)'}
                    className="stagger-3"
                />
                <StatsCard
                    label="Profit Factor"
                    value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
                    subtext={`Avg R:R ${stats.avgRR.toFixed(2)} · ${stats.closedTrades} trades`}
                    icon={<BarChart3 size={16} />}
                    accentColor={stats.profitFactor >= 1.5 ? 'var(--fx-profit)' : 'var(--fx-gold)'}
                    className="stagger-4"
                />
            </div>

            {allTrades.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        label="Total Pips"
                        value={`${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips.toFixed(1)}`}
                        accentColor={stats.totalPips >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)'}
                        className="stagger-1"
                    />
                    <StatsCard
                        label="Best Trade"
                        value={`+${formatCurrency(stats.largestWin, portfolio.currency)}`}
                        accentColor="var(--fx-profit)"
                        className="stagger-2"
                    />
                    <StatsCard
                        label="Worst Trade"
                        value={formatCurrency(stats.largestLoss, portfolio.currency)}
                        accentColor="var(--fx-loss)"
                        className="stagger-3"
                    />
                    <StatsCard
                        label="Best Pair"
                        value={stats.bestPair ?? '—'}
                        icon={<Layers size={16} />}
                        accentColor="var(--fx-gold)"
                        className="stagger-4"
                    />
                </div>
            )}

            <div className="space-y-3 animate-slide-up">
                <h2 className="text-base font-bold" style={{ color: '#c8ddef' }}>
                    Trade History
                </h2>
                <TradesTable
                    trades={allTrades}
                    onEdit={handleOpenEdit}
                    onDelete={(id) => deleteTrade.mutate(id)}
                    isDeleting={deleteTrade.isPending}
                    currency={portfolio.currency}
                />
            </div>

            <TradeDialog
                open={tradeDialogOpen}
                onOpenChange={handleDialogClose}
                portfolioId={portfolioId}
                editTrade={editingTrade}
                onSubmit={(data) =>
                    editingTrade
                        ? updateTrade.mutate({ id: editingTrade.id, data })
                        : createTrade.mutate(data)
                }
                isLoading={createTrade.isPending || updateTrade.isPending}
            />
        </div>
    );
}
