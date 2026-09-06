'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/stats-card';
import { TradesTable } from '@/components/trades-table';
import { useAccount } from '@/lib/account-context';
import { usePortfolioTrades } from '@/hooks/use-portfolios';
import {
    formatCurrency,
    formatPercent,
    calculateFxStats,
    calculatePortfolioGain,
} from '@/lib/portfolio-utils';
import {
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3,
    Wallet,
    Activity,
    Layers,
    Zap,
} from 'lucide-react';

const PAGE_STYLE = { padding: '32px 36px', maxWidth: 1440, margin: '0 auto' };
const LABEL_STYLE = { color: '#3a5c7a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.14em' };

const ACCOUNT_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
    LIVE: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    DEMO: { bg: 'rgba(90,120,150,0.12)', color: '#7a9ab8' },
    PROP: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
};

export default function Dashboard() {
    const { activePortfolio, portfolios, isLoading: accountLoading } = useAccount();

    const { data: trades = [], isLoading: tradesLoading } = usePortfolioTrades(activePortfolio?.id ?? '');

    const stats = useMemo(() => {
        if (!trades.length) return null;
        return calculateFxStats(trades);
    }, [trades]);

    const { gain, gainPercent } = useMemo(() => {
        if (!activePortfolio) return { gain: 0, gainPercent: 0 };
        return calculatePortfolioGain(activePortfolio);
    }, [activePortfolio]);

    const recentTrades = useMemo(() => {
        return [...trades]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
    }, [trades]);

    // ─── Loading skeleton ─────────────────────────────────────────────────────
    if (accountLoading) {
        return (
            <div style={PAGE_STYLE}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 32 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: 110, borderRadius: 12, background: '#0d1524', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            </div>
        );
    }

    // ─── No accounts ─────────────────────────────────────────────────────────
    if (!portfolios || portfolios.length === 0) {
        return (
            <div style={PAGE_STYLE}>
                <div style={{
                    borderRadius: 16, padding: '64px 32px', textAlign: 'center',
                    background: '#0d1524',
                }}>
                    <TrendingUp size={36} style={{ color: '#3a5c7a', margin: '0 auto 16px' }} />
                    <h2 style={{ color: '#c8ddef', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Welcome to FX Journal</h2>
                    <p style={{ color: '#4a6080', fontSize: 14, margin: '0 0 20px' }}>
                        Create your first trading account to start tracking FOREX trades.
                    </p>
                    <Link href="/portfolios" className="btn-fx">Create Account</Link>
                </div>
            </div>
        );
    }

    const isProfit = gain >= 0;
    const typeStyle = ACCOUNT_TYPE_STYLE[activePortfolio?.accountType ?? 'DEMO'];

    return (
        <div style={PAGE_STYLE}>

            {/* ─── Page Header ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Activity size={14} color="#3a5c7a" />
                    <span style={LABEL_STYLE}>Dashboard</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h1 style={{ color: '#c8ddef', fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>
                        {activePortfolio?.name ?? 'Dashboard'}
                    </h1>
                    {activePortfolio && (
                        <span style={{
                            fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                            background: typeStyle.bg, color: typeStyle.color,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            {activePortfolio.accountType}
                        </span>
                    )}
                </div>
                <p style={{ color: '#4a6080', fontSize: 13, marginTop: 4 }}>
                    {activePortfolio?.broker && <span>{activePortfolio.broker} · </span>}
                    {activePortfolio?.currency}
                    <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                    {trades.length} trade{trades.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* ─── Stats Row 1: Balance, P&L, Win Rate, Profit Factor ───────── */}
            {activePortfolio && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                    <StatsCard
                        label="Balance"
                        value={formatCurrency(activePortfolio.currentBalance, activePortfolio.currency)}
                        subtext={`Initial: ${formatCurrency(activePortfolio.initialBalance, activePortfolio.currency)}`}
                        icon={<Wallet size={16} />}
                        accentColor="#7aA8cc"
                        className="stagger-1"
                    />
                    <StatsCard
                        label="P&L"
                        value={`${gain >= 0 ? '+' : ''}${formatCurrency(gain, activePortfolio.currency)}`}
                        change={formatPercent(gainPercent)}
                        changeType={isProfit ? 'positive' : 'negative'}
                        subtext="vs initial balance"
                        icon={isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        accentColor={isProfit ? '#10b981' : '#ef4444'}
                        className="stagger-2"
                    />
                    <StatsCard
                        label="Win Rate"
                        value={stats ? `${stats.winRate.toFixed(1)}%` : '—'}
                        subtext={stats ? `${stats.winCount}W · ${stats.lossCount}L · ${stats.beCount}BE` : 'No trades yet'}
                        icon={<Target size={16} />}
                        accentColor={stats && stats.winRate >= 50 ? '#10b981' : '#ef4444'}
                        className="stagger-3"
                    />
                    <StatsCard
                        label="Profit Factor"
                        value={stats ? (stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)) : '—'}
                        subtext={stats ? `Avg R:R ${stats.avgRR.toFixed(2)}` : 'No closed trades'}
                        icon={<BarChart3 size={16} />}
                        accentColor={stats && stats.profitFactor >= 1.5 ? '#10b981' : stats && stats.profitFactor >= 1 ? '#f59e0b' : '#ef4444'}
                        className="stagger-4"
                    />
                </div>
            )}

            {/* ─── Stats Row 2: Avg Win/Loss, Best Pair/Session ────────────── */}
            {stats && stats.closedTrades > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
                    <StatsCard label="Avg Win" value={formatCurrency(stats.avgWin, activePortfolio?.currency)} icon={<Zap size={16} />} accentColor="#10b981" className="stagger-1" />
                    <StatsCard label="Avg Loss" value={formatCurrency(stats.avgLoss, activePortfolio?.currency)} icon={<Zap size={16} />} accentColor="#ef4444" className="stagger-2" />
                    <StatsCard label="Best Pair" value={stats.bestPair ?? '—'} subtext="By total P&L" icon={<Layers size={16} />} accentColor="#f59e0b" className="stagger-3" />
                    <StatsCard label="Best Session" value={stats.bestSession?.replace('_', ' ') ?? '—'} subtext="Highest win rate" icon={<Activity size={16} />} accentColor="#7aA8cc" className="stagger-4" />
                </div>
            )}

            {/* ─── Recent Trades ────────────────────────────────────────────── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ color: '#c8ddef', fontSize: 16, fontWeight: 700, margin: 0 }}>
                        Recent Trades
                    </h2>
                    <a href="/trades" style={{ color: '#7aA8cc', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                        View all →
                    </a>
                </div>

                {tradesLoading ? (
                    <div style={{ height: 180, borderRadius: 12, background: '#0d1524', animation: 'pulse 1.5s infinite' }} />
                ) : (
                    <div style={{ background: '#0d1524', borderRadius: 12, overflow: 'hidden' }}>
                        <TradesTable
                            trades={recentTrades}
                            currency={activePortfolio?.currency}
                            accountName={activePortfolio?.name}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
