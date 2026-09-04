'use client';

import { useMemo } from 'react';
import { StatsCard } from '@/components/stats-card';
import { TradesTable } from '@/components/trades-table';
import { usePortfolios } from '@/hooks/use-portfolios';
import {
    formatCurrency,
    formatPercent,
    calculateAllAccountsStats,
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
const HEADING_STYLE = { color: '#e2e8f0', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 };
const SUBTEXT_STYLE = { color: '#7b8fa8', fontSize: 13, marginTop: 4, margin: 0 };
const LABEL_STYLE = { color: '#00d4ff', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.12em' };

export default function Dashboard() {
    const { data: portfolios, isLoading } = usePortfolios();

    const agg = useMemo(() => {
        if (!portfolios || portfolios.length === 0) return null;
        return calculateAllAccountsStats(portfolios);
    }, [portfolios]);

    const recentTrades = useMemo(() => {
        if (!portfolios) return [];
        return portfolios
            .flatMap(p => p.trades ?? [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
    }, [portfolios]);

    if (isLoading) {
        return (
            <div style={PAGE_STYLE}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 32 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: 110, borderRadius: 12, background: '#1e2636', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={PAGE_STYLE}>

            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Activity size={14} color="#00d4ff" />
                    <span style={LABEL_STYLE}>Overview</span>
                </div>
                <h1 style={HEADING_STYLE}>Dashboard</h1>
                <p style={SUBTEXT_STYLE}>
                    {agg?.portfolioCount ?? 0} account{agg?.portfolioCount !== 1 ? 's' : ''}
                    &nbsp;·&nbsp;
                    {agg?.totalTrades ?? 0} total trades
                </p>
            </div>

            {agg && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                    <StatsCard
                        label="Total Balance"
                        value={formatCurrency(agg.totalCurrent)}
                        subtext={`Initial: ${formatCurrency(agg.totalInitial)}`}
                        icon={<Wallet size={16} />}
                        accentColor="#00d4ff"
                        className="stagger-1"
                    />
                    <StatsCard
                        label="Total P&L"
                        value={`${agg.totalGain >= 0 ? '+' : ''}${formatCurrency(agg.totalGain)}`}
                        change={formatPercent(agg.totalGainPercent)}
                        changeType={agg.totalGain >= 0 ? 'positive' : 'negative'}
                        subtext="All accounts combined"
                        icon={agg.totalGain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        accentColor={agg.totalGain >= 0 ? '#10b981' : '#ef4444'}
                        className="stagger-2"
                    />
                    <StatsCard
                        label="Win Rate"
                        value={`${agg.winRate.toFixed(1)}%`}
                        subtext={`${agg.winCount}W · ${agg.lossCount}L · ${agg.beCount}BE`}
                        icon={<Target size={16} />}
                        accentColor={agg.winRate >= 50 ? '#10b981' : '#ef4444'}
                        className="stagger-3"
                    />
                    <StatsCard
                        label="Profit Factor"
                        value={agg.profitFactor === Infinity ? '∞' : agg.profitFactor.toFixed(2)}
                        subtext={`Avg R:R ${agg.avgRR.toFixed(2)}`}
                        icon={<BarChart3 size={16} />}
                        accentColor={agg.profitFactor >= 1.5 ? '#10b981' : agg.profitFactor >= 1 ? '#f59e0b' : '#ef4444'}
                        className="stagger-4"
                    />
                </div>
            )}

            {agg && agg.totalTrades > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
                    <StatsCard label="Avg Win" value={formatCurrency(agg.avgWin)} icon={<Zap size={16} />} accentColor="#10b981" className="stagger-1" />
                    <StatsCard label="Avg Loss" value={formatCurrency(agg.avgLoss)} icon={<Zap size={16} />} accentColor="#ef4444" className="stagger-2" />
                    <StatsCard label="Best Pair" value={agg.bestPair ?? '—'} subtext="By total P&L" icon={<Layers size={16} />} accentColor="#f59e0b" className="stagger-3" />
                    <StatsCard label="Best Session" value={agg.bestSession?.replace('_', ' ') ?? '—'} subtext="Highest win rate" icon={<Activity size={16} />} accentColor="#00d4ff" className="stagger-4" />
                </div>
            )}

            {recentTrades.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Trades</h2>
                        <a href="/trades" style={{ color: '#00d4ff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                            View all →
                        </a>
                    </div>
                    <div style={{ background: '#141824', border: '1px solid #2a3347', borderRadius: 12, overflow: 'hidden' }}>
                        <TradesTable trades={recentTrades} />
                    </div>
                </div>
            )}

            {(!agg || agg.portfolioCount === 0) && (
                <div style={{
                    borderRadius: 16, padding: '64px 32px', textAlign: 'center',
                    border: '2px dashed #2a3347', background: '#141824',
                }}>
                    <TrendingUp size={40} style={{ color: '#2a3347', margin: '0 auto 16px' }} />
                    <h2 style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Welcome to FX Journal</h2>
                    <p style={{ color: '#7b8fa8', fontSize: 14, margin: '0 0 20px' }}>
                        Create your first trading account to start tracking FOREX trades.
                    </p>
                    <a href="/portfolios" className="btn-fx">Create Account</a>
                </div>
            )}
        </div>
    );
}
