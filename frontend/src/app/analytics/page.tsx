'use client';

import { useMemo } from 'react';
import { useAccount } from '@/lib/account-context';
import { usePortfolioTrades } from '@/hooks/use-portfolios';
import {
    formatCurrency,
    calculateFxStats,
    buildEquityCurve,
} from '@/lib/portfolio-utils';
import { BarChart3, TrendingUp, Target, Zap, Calendar } from 'lucide-react';

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min((Math.abs(value) / max) * 100, 100) : 0;
    return (
        <div className="h-1.5 rounded-full w-full" style={{ background: '#070d18' }}>
            <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
}

function EquityCurve({ points }: { points: Array<{ balance: number }> }) {
    if (points.length < 2) return (
        <div className="flex items-center justify-center h-full" style={{ color: '#4a6080', fontSize: 13 }}>
            Not enough data to draw curve.
        </div>
    );

    const W = 600, H = 160;
    const values = points.map(p => p.balance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const coords = values.map((v, i) => ({
        x: (i / (values.length - 1)) * W,
        y: H - ((v - min) / range) * H,
    }));

    const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const fillD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

    const isUp = values[values.length - 1] >= values[0];
    const lineColor = isUp ? '#10b981' : '#ef4444';

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '160px' }}>
            <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill="url(#equityFill)" />
            <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="3.5"
                fill={lineColor}
            />
        </svg>
    );
}

function WinLossDonut({ win, loss, be }: { win: number; loss: number; be: number }) {
    const total = win + loss + be;
    if (total === 0) return <div className="text-center text-sm" style={{ color: '#4a6080' }}>No closed trades</div>;

    const winPct = (win / total) * 100;
    const lossPct = (loss / total) * 100;
    const bePct = (be / total) * 100;

    return (
        <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="3.6"
                        strokeDasharray={`${lossPct} ${100 - lossPct}`}
                        strokeDashoffset={`${0}`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#5a7896" strokeWidth="3.6"
                        strokeDasharray={`${bePct} ${100 - bePct}`}
                        strokeDashoffset={`${-lossPct}`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.6"
                        strokeDasharray={`${winPct} ${100 - winPct}`}
                        strokeDashoffset={`${-(lossPct + bePct)}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold fx-number" style={{ color: '#c8ddef' }}>
                        {winPct.toFixed(0)}%
                    </span>
                    <span className="text-xs" style={{ color: '#4a6080' }}>WR</span>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#10b981' }} />
                    <span style={{ color: '#4a6080' }}>Win</span>
                    <span className="ml-auto font-bold fx-number" style={{ color: '#10b981' }}>{win}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#ef4444' }} />
                    <span style={{ color: '#4a6080' }}>Loss</span>
                    <span className="ml-auto font-bold fx-number" style={{ color: '#ef4444' }}>{loss}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#5a7896' }} />
                    <span style={{ color: '#4a6080' }}>BE</span>
                    <span className="ml-auto font-bold fx-number" style={{ color: '#7a9ab8' }}>{be}</span>
                </div>
            </div>
        </div>
    );
}

function PairsBreakdown({ trades }: { trades: Array<{ pair: string; result?: number; outcome?: string }> }) {
    const byPair = useMemo(() => {
        const map: Record<string, { pl: number; count: number; wins: number }> = {};
        trades.forEach(t => {
            if (!map[t.pair]) map[t.pair] = { pl: 0, count: 0, wins: 0 };
            map[t.pair].pl += t.result ?? 0;
            map[t.pair].count++;
            if (t.outcome === 'WIN') map[t.pair].wins++;
        });
        return Object.entries(map)
            .map(([pair, v]) => ({ pair, ...v, wr: v.count > 0 ? (v.wins / v.count) * 100 : 0 }))
            .sort((a, b) => b.pl - a.pl);
    }, [trades]);

    if (byPair.length === 0) return (
        <p className="text-sm text-center py-4" style={{ color: 'var(--muted-foreground)' }}>No trade data</p>
    );

    const maxAbs = Math.max(...byPair.map(p => Math.abs(p.pl)));

    return (
        <div className="space-y-3">
            {byPair.slice(0, 8).map(({ pair, pl, count, wr }) => (
                <div key={pair}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="pair-label text-sm">{pair}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{count}t · {wr.toFixed(0)}%WR</span>
                            <span
                                className="text-sm font-bold fx-number w-20 text-right"
                                style={{ color: pl >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)' }}
                            >
                                {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                            </span>
                        </div>
                    </div>
                    <MiniBar value={pl} max={maxAbs} color={pl >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)'} />
                </div>
            ))}
        </div>
    );
}

function SessionBreakdown({ trades }: { trades: Array<{ session?: string; result?: number; outcome?: string }> }) {
    const SESSION_COLORS: Record<string, string> = {
        LONDON: '#63b3ed',
        NEW_YORK: '#8ab0cc',
        TOKYO: '#fcd34d',
        SYDNEY: '#10b981',
        OVERLAP: '#a78bfa',
    };

    const bySession = useMemo(() => {
        const map: Record<string, { pl: number; count: number; wins: number }> = {};
        trades.forEach(t => {
            const s = t.session ?? 'OTHER';
            if (!map[s]) map[s] = { pl: 0, count: 0, wins: 0 };
            map[s].pl += t.result ?? 0;
            map[s].count++;
            if (t.outcome === 'WIN') map[s].wins++;
        });
        return Object.entries(map)
            .map(([session, v]) => ({ session, ...v, wr: v.count > 0 ? (v.wins / v.count) * 100 : 0 }))
            .sort((a, b) => b.wr - a.wr);
    }, [trades]);

    if (bySession.length === 0) return (
        <p className="text-sm text-center py-4" style={{ color: '#4a6080' }}>No session data</p>
    );

    return (
        <div className="space-y-3">
            {bySession.map(({ session, pl, count, wr }) => (
                <div key={session} className="flex items-center gap-3">
                    <div
                        className="w-1.5 h-7 rounded-sm flex-shrink-0"
                        style={{ background: SESSION_COLORS[session] || '#4a6080' }}
                    />
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold" style={{ color: '#c8ddef' }}>
                                {session.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-bold fx-number" style={{ color: pl >= 0 ? '#10b981' : '#ef4444' }}>
                                {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: '#4a6080' }}>
                            <span>{count} trade{count !== 1 ? 's' : ''}</span>
                            <span>{wr.toFixed(0)}% WR</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MonthlyPL({ trades }: { trades: Array<{ date: string; result?: number }> }) {
    const monthly = useMemo(() => {
        const map: Record<string, number> = {};
        trades.forEach(t => {
            const key = t.date.slice(0, 7); // YYYY-MM
            map[key] = (map[key] ?? 0) + (t.result ?? 0);
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12);
    }, [trades]);

    if (monthly.length === 0) return (
        <p className="text-sm text-center py-4" style={{ color: '#4a6080' }}>No monthly data</p>
    );

    const maxAbs = Math.max(...monthly.map(([, v]) => Math.abs(v)));

    return (
        <div className="flex items-end gap-2 h-24">
            {monthly.map(([month, pl]) => {
                const pct = maxAbs > 0 ? Math.abs(pl) / maxAbs : 0;
                const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full rounded-t-sm transition-all"
                            style={{
                                height: `${Math.max(pct * 80, 4)}px`,
                                background: pl >= 0 ? '#10b981' : '#ef4444',
                                opacity: 0.85,
                            }}
                            title={`${label}: ${pl >= 0 ? '+' : ''}${formatCurrency(pl)}`}
                        />
                        <span className="text-xs" style={{ color: '#4a6080', fontSize: 10, whiteSpace: 'nowrap' }}>
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function AnalyticsPage() {
    const { activePortfolio, isLoading: accountLoading } = useAccount();
    const { data: allTrades = [], isLoading: tradesLoading } = usePortfolioTrades(activePortfolio?.id ?? '');

    const isLoading = accountLoading || tradesLoading;

    const stats = useMemo(() => calculateFxStats(allTrades), [allTrades]);

    const equityCurve = useMemo(() => {
        if (!activePortfolio) return [];
        return buildEquityCurve(activePortfolio.initialBalance, allTrades, activePortfolio.cashTransactions ?? []);
    }, [activePortfolio, allTrades]);

    if (isLoading) {
        return (
            <div className="page-container space-y-8">
                <div className="h-8 w-40 rounded-lg animate-pulse" style={{ background: '#0d1524' }} />
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: '#0d1524' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container space-y-8">
            <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={14} color="#3a5c7a" />
                    <span className="text-xs font-semibold uppercase" style={{ color: '#3a5c7a', letterSpacing: '0.14em' }}>
                        Performance
                    </span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: '#c8ddef', letterSpacing: '-0.025em' }}>
                    {activePortfolio?.name ?? 'Analytics'}
                </h1>
                <p className="mt-1 text-sm" style={{ color: '#4a6080' }}>
                    {activePortfolio?.broker && <span>{activePortfolio.broker} · </span>}
                    {stats.closedTrades} closed trade{stats.closedTrades !== 1 ? 's' : ''} analyzed
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up stagger-1">
                {[
                    { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: stats.winRate >= 50 ? '#10b981' : '#ef4444', icon: <Target size={15} /> },
                    { label: 'Profit Factor', value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1.5 ? '#10b981' : '#f59e0b', icon: <Zap size={15} /> },
                    { label: 'Avg R:R', value: `${stats.avgRR.toFixed(2)}R`, color: '#7aA8cc', icon: <TrendingUp size={15} /> },
                    { label: 'Total Pips', value: `${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips.toFixed(1)}`, color: stats.totalPips >= 0 ? '#10b981' : '#ef4444', icon: <BarChart3 size={15} /> },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase" style={{ color: '#3a5c7a', letterSpacing: '0.12em' }}>
                                {label}
                            </span>
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                background: 'rgba(90, 120, 150, 0.10)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color,
                            }}>
                                {icon}
                            </div>
                        </div>
                        <p className="text-2xl font-bold fx-number" style={{ color: '#c8ddef' }}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div
                    className="glass-card p-6 animate-slide-up stagger-1"
                    style={{ gridColumn: '1 / -1' }}
                >
                    <h2 className="text-sm font-bold mb-1" style={{ color: '#c8ddef' }}>
                        Equity Curve
                    </h2>
                    <p className="text-xs mb-4" style={{ color: '#4a6080' }}>
                        Account balance over time
                    </p>
                    <EquityCurve points={equityCurve} />
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-2">
                    <h2 className="text-sm font-bold mb-1" style={{ color: '#c8ddef' }}>
                        Outcome Distribution
                    </h2>
                    <p className="text-xs mb-5" style={{ color: '#4a6080' }}>
                        Trade results breakdown
                    </p>
                    <WinLossDonut win={stats.winCount} loss={stats.lossCount} be={stats.beCount} />

                    {stats.closedTrades > 0 && (
                        <div className="mt-5 pt-4 border-t grid grid-cols-2 gap-4" style={{ borderColor: 'rgba(74, 96, 128, 0.10)' }}>
                            <div>
                                <p className="text-xs" style={{ color: '#4a6080' }}>Avg Win</p>
                                <p className="text-base font-bold fx-number" style={{ color: '#10b981' }}>
                                    +{formatCurrency(stats.avgWin)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#4a6080' }}>Avg Loss</p>
                                <p className="text-base font-bold fx-number" style={{ color: '#ef4444' }}>
                                    {formatCurrency(stats.avgLoss)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-3">
                    <h2 className="text-sm font-bold mb-1" style={{ color: '#c8ddef' }}>
                        Pairs Breakdown
                    </h2>
                    <p className="text-xs mb-5" style={{ color: '#4a6080' }}>
                        P&L and win rate by currency pair
                    </p>
                    <PairsBreakdown trades={allTrades} />
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-4">
                    <h2 className="text-sm font-bold mb-1" style={{ color: '#c8ddef' }}>
                        Session Performance
                    </h2>
                    <p className="text-xs mb-5" style={{ color: '#4a6080' }}>
                        Trading results by market session
                    </p>
                    <SessionBreakdown trades={allTrades} />
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-5" style={{ gridColumn: '1 / -1' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} color="#3a5c7a" />
                        <h2 className="text-sm font-bold" style={{ color: '#c8ddef' }}>
                            Monthly P&L
                        </h2>
                    </div>
                    <p className="text-xs mb-5" style={{ color: '#4a6080' }}>
                        Net profit/loss per month (last 12 months)
                    </p>
                    <MonthlyPL trades={allTrades} />
                </div>
            </div>

            {stats.closedTrades > 0 && (
                <div className="glass-card p-6 animate-slide-up">
                    <h2 className="text-sm font-bold mb-4" style={{ color: '#c8ddef' }}>
                        Detailed Statistics
                    </h2>
                    <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { label: 'Total Trades', value: stats.totalTrades.toString() },
                            { label: 'Closed Trades', value: stats.closedTrades.toString() },
                            { label: 'Open Trades', value: stats.openTrades.toString() },
                            { label: 'Best Trade', value: `+${formatCurrency(stats.largestWin)}`, color: '#10b981' },
                            { label: 'Worst Trade', value: formatCurrency(stats.largestLoss), color: '#ef4444' },
                            { label: 'Total Pips', value: `${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips.toFixed(1)}`, color: stats.totalPips >= 0 ? '#10b981' : '#ef4444' },
                            { label: 'Best Pair', value: stats.bestPair ?? '—', color: '#f59e0b' },
                            { label: 'Worst Pair', value: stats.worstPair ?? '—', color: '#ef4444' },
                            { label: 'Best Session', value: stats.bestSession?.replace('_', ' ') ?? '—', color: '#7aA8cc' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(74, 96, 128, 0.08)' }}>
                                <span className="text-xs" style={{ color: '#4a6080' }}>{label}</span>
                                <span className="text-sm font-bold fx-number" style={{ color: color || '#c8ddef' }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.closedTrades === 0 && (
                <div
                    className="rounded-xl p-16 text-center animate-fade-in"
                    style={{ background: '#0d1524' }}
                >
                    <BarChart3 size={40} className="mx-auto mb-4" style={{ color: '#3a5c7a' }} />
                    <p className="text-sm font-medium" style={{ color: '#4a6080' }}>
                        Log some trades to see your analytics.
                    </p>
                </div>
            )}
        </div>
    );
}
