'use client';

import { useMemo } from 'react';
import { TradesTable } from '@/components/trades-table';
import { TradeDialog } from '@/components/trade-dialog';
import { useAccount } from '@/lib/account-context';
import { usePortfolioTrades, useCreateTrade, useUpdateTrade, useDeleteTrade } from '@/hooks/use-portfolios';
import { ForexTrade } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Plus, ScrollText, Target, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { formatCurrency, calculateFxStats, calculatePortfolioGain } from '@/lib/portfolio-utils';
import { useState } from 'react';

export default function TradesPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState<ForexTrade | undefined>();

    const { activePortfolio, portfolios, isLoading: accountLoading } = useAccount();
    const createTrade = useCreateTrade();
    const updateTrade = useUpdateTrade();
    const deleteTrade = useDeleteTrade();

    const handleOpenEdit = (trade: ForexTrade) => {
        setEditingTrade(trade);
        setDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) setEditingTrade(undefined);
    };

    // Fetch trades scoped to the active portfolio only
    const { data: rawTrades = [], isLoading: tradesLoading } = usePortfolioTrades(activePortfolio?.id ?? '');

    const trades = useMemo(() =>
        [...rawTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [rawTrades]
    );

    const stats = useMemo(() => {
        if (!trades.length) return null;
        return calculateFxStats(trades);
    }, [trades]);

    const { gain, gainPercent } = useMemo(() => {
        if (!activePortfolio) return { gain: 0, gainPercent: 0 };
        return calculatePortfolioGain(activePortfolio);
    }, [activePortfolio]);

    // ─── Loading skeleton ─────────────────────────────────────────────────────
    if (accountLoading) {
        return (
            <div className="page-container space-y-6">
                <div className="h-8 w-40 rounded-lg animate-pulse" style={{ background: '#0d1524' }} />
                <div className="h-64 rounded-xl animate-pulse" style={{ background: '#0d1524' }} />
            </div>
        );
    }

    // ─── No accounts ─────────────────────────────────────────────────────────
    if (!portfolios || portfolios.length === 0) {
        return (
            <div className="page-container">
                <div style={{
                    borderRadius: 16, padding: '72px 32px', textAlign: 'center',
                    background: '#0d1524', marginTop: 24,
                }}>
                    <ScrollText size={40} style={{ color: '#3a5c7a', margin: '0 auto 16px' }} />
                    <h2 style={{ color: '#c8ddef', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
                        No Trading Accounts Yet
                    </h2>
                    <p style={{ color: '#4a6080', fontSize: 14, margin: '0 0 20px' }}>
                        Create a trading account first to start logging trades.
                    </p>
                    <a href="/portfolios" className="btn-fx" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                        <Plus size={15} /> Create Account
                    </a>
                </div>
            </div>
        );
    }

    const isProfit = gain >= 0;

    return (
        <div className="page-container space-y-6">

            {/* ─── Page Header ──────────────────────────────────────────────── */}
            <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <ScrollText size={14} color="#3a5c7a" />
                        <span style={{
                            color: '#3a5c7a', fontSize: 11, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.14em',
                        }}>
                            Trade Log
                        </span>
                    </div>
                    <h1 style={{ color: '#c8ddef', fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>
                        {activePortfolio?.name ?? 'Trades'}
                    </h1>
                    <p style={{ color: '#4a6080', fontSize: 13, marginTop: 3 }}>
                        {activePortfolio?.broker && <span>{activePortfolio.broker} · </span>}
                        <span>{tradesLoading ? '…' : `${trades.length} trade${trades.length !== 1 ? 's' : ''}`}</span>
                    </p>
                </div>

                <Button
                    onClick={() => setDialogOpen(true)}
                    disabled={!activePortfolio}
                    className="btn-fx"
                    style={{ border: 'none', gap: 6, flexShrink: 0, marginTop: 4 }}
                >
                    <Plus size={15} />
                    Log Trade
                </Button>
            </div>

            {/* ─── Per-Account Stats Mini-Bar ───────────────────────────────── */}
            {stats && stats.closedTrades > 0 && !tradesLoading && (
                <div className="animate-slide-up stagger-1" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 10,
                }}>
                    {[
                        {
                            icon: <Target size={13} />,
                            label: 'Win Rate',
                            value: `${stats.winRate.toFixed(1)}%`,
                            sub: `${stats.winCount}W · ${stats.lossCount}L · ${stats.beCount}BE`,
                            color: stats.winRate >= 50 ? '#10b981' : '#ef4444',
                        },
                        {
                            icon: isProfit ? <TrendingUp size={13} /> : <TrendingUp size={13} style={{ transform: 'scaleY(-1)' }} />,
                            label: 'Total P&L',
                            value: `${gain >= 0 ? '+' : ''}${formatCurrency(gain, activePortfolio?.currency)}`,
                            sub: `${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%`,
                            color: isProfit ? '#10b981' : '#ef4444',
                        },
                        {
                            icon: <BarChart2 size={13} />,
                            label: 'Profit Factor',
                            value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2),
                            sub: `Avg R:R ${stats.avgRR.toFixed(2)}`,
                            color: stats.profitFactor >= 1.5 ? '#10b981' : stats.profitFactor >= 1 ? '#f59e0b' : '#ef4444',
                        },
                        {
                            icon: <Activity size={13} />,
                            label: 'Total Pips',
                            value: `${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips.toFixed(1)}`,
                            sub: `${stats.closedTrades} closed`,
                            color: stats.totalPips >= 0 ? '#10b981' : '#ef4444',
                        },
                    ].map(({ icon, label, value, sub, color }) => (
                        <div key={label} style={{
                            background: '#0d1524', borderRadius: 10, padding: '14px 16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                <span style={{ color: '#3a5c7a' }}>{icon}</span>
                                <span style={{ color: '#3a5c7a', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
                                    {label}
                                </span>
                            </div>
                            <p style={{ color, fontFamily: 'var(--fx-font-mono)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', margin: '0 0 2px' }}>
                                {value}
                            </p>
                            <p style={{ color: '#4a6080', fontSize: 11, margin: 0 }}>{sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Trades Table ─────────────────────────────────────────────── */}
            <div className="animate-slide-up stagger-2">
                {tradesLoading ? (
                    <div style={{ borderRadius: 12, height: 200, background: '#0d1524', animation: 'pulse 1.5s infinite' }} />
                ) : (
                    <TradesTable
                        trades={trades}
                        onEdit={handleOpenEdit}
                        onDelete={(id) => deleteTrade.mutate(id)}
                        isDeleting={deleteTrade.isPending}
                        currency={activePortfolio?.currency}
                        accountName={activePortfolio?.name}
                    />
                )}
            </div>

            {/* ─── Trade Dialog ─────────────────────────────────────────────── */}
            {activePortfolio && (
                <TradeDialog
                    open={dialogOpen}
                    onOpenChange={handleDialogClose}
                    portfolioId={activePortfolio.id}
                    editTrade={editingTrade}
                    onSubmit={(data) =>
                        editingTrade
                            ? updateTrade.mutate({ id: editingTrade.id, data })
                            : createTrade.mutate(data)
                    }
                    isLoading={createTrade.isPending || updateTrade.isPending}
                />
            )}
        </div>
    );
}
