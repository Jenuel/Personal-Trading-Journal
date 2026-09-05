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
        <div className="h-2 rounded-full w-full" style={{ background: 'var(--muted)' }}>
            <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
}

function EquityCurve({ points }: { points: Array<{ balance: number }> }) {
    if (points.length < 2) return (
        <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
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
    const lineColor = isUp ? 'oklch(0.72 0.19 155)' : 'oklch(0.65 0.22 25)';

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '160px' }}>
            <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? 'oklch(0.72 0.19 155)' : 'oklch(0.65 0.22 25)'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={isUp ? 'oklch(0.72 0.19 155)' : 'oklch(0.65 0.22 25)'} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill="url(#equityFill)" />
            <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="4"
                fill={lineColor}
            />
        </svg>
    );
}

function WinLossDonut({ win, loss, be }: { win: number; loss: number; be: number }) {
    const total = win + loss + be;
    if (total === 0) return <div className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No closed trades</div>;

    const winPct = (win / total) * 100;
    const lossPct = (loss / total) * 100;
    const bePct = (be / total) * 100;

    return (
        <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.65 0.22 25)" strokeWidth="3.8"
                        strokeDasharray={`${lossPct} ${100 - lossPct}`}
                        strokeDashoffset={`${0}`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.60 0.015 230)" strokeWidth="3.8"
                        strokeDasharray={`${bePct} ${100 - bePct}`}
                        strokeDashoffset={`${-lossPct}`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.72 0.19 155)" strokeWidth="3.8"
                        strokeDasharray={`${winPct} ${100 - winPct}`}
                        strokeDashoffset={`${-(lossPct + bePct)}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold fx-number" style={{ color: 'var(--foreground)' }}>
                        {winPct.toFixed(0)}%
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>WR</span>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'oklch(0.72 0.19 155)' }} />
                    <span style={{ color: 'var(--muted-foreground)' }}>Win</span>
                    <span className="ml-auto font-bold fx-number" style={{ color: 'var(--fx-profit)' }}>{win}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'oklch(0.65 0.22 25)' }} />
                    <span style={{ color: 'var(--muted-foreground)' }}>Loss</span>
                    <span className="ml-auto font-bold fx-number" style={{ color: 'var(--fx-loss)' }}>{loss}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'oklch(0.60 0.015 230)' }} />
                    <span style={{ color: 'var(--muted-foreground)' }}>BE</span>
                    <span className="ml-auto font-bold fx-number" style={{ color: 'var(--fx-neutral)' }}>{be}</span>
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
        LONDON: 'oklch(0.55 0.20 235)',
        NEW_YORK: 'oklch(0.72 0.19 200)',
        TOKYO: 'oklch(0.70 0.18 55)',
        SYDNEY: 'oklch(0.72 0.19 155)',
        OVERLAP: 'oklch(0.75 0.18 290)',
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
        <p className="text-sm text-center py-4" style={{ color: 'var(--muted-foreground)' }}>No session data</p>
    );

    return (
        <div className="space-y-3">
            {bySession.map(({ session, pl, count, wr }) => (
                <div key={session} className="flex items-center gap-3">
                    <div
                        className="w-2 h-8 rounded-sm flex-shrink-0"
                        style={{ background: SESSION_COLORS[session] || 'var(--muted-foreground)' }}
                    />
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                {session.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-bold fx-number" style={{ color: pl >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)' }}>
                                {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
        <p className="text-sm text-center py-4" style={{ color: 'var(--muted-foreground)' }}>No monthly data</p>
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
                                background: pl >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)',
                                opacity: 0.8,
                            }}
                            title={`${label}: ${pl >= 0 ? '+' : ''}${formatCurrency(pl)}`}
                        />
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: 10, whiteSpace: 'nowrap' }}>
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
                <div className="h-8 w-40 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--muted)' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container space-y-8">
            <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={16} style={{ color: 'var(--fx-accent)' }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fx-accent)', letterSpacing: '0.12em' }}>
                        Performance
                    </span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                    {activePortfolio?.name ?? 'Analytics'}
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {activePortfolio?.broker && <span>{activePortfolio.broker} · </span>}
                    {stats.closedTrades} closed trade{stats.closedTrades !== 1 ? 's' : ''} analyzed
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up stagger-1">
                {[
                    { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: stats.winRate >= 50 ? 'var(--fx-profit)' : 'var(--fx-loss)', icon: <Target size={16} /> },
                    { label: 'Profit Factor', value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1.5 ? 'var(--fx-profit)' : 'var(--fx-gold)', icon: <Zap size={16} /> },
                    { label: 'Avg R:R', value: `${stats.avgRR.toFixed(2)}R`, color: 'var(--fx-accent)', icon: <TrendingUp size={16} /> },
                    { label: 'Total Pips', value: `${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips.toFixed(1)}`, color: stats.totalPips >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)', icon: <BarChart3 size={16} /> },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                                {label}
                            </span>
                            <div style={{ color, opacity: 0.7 }}>{icon}</div>
                        </div>
                        <p className="text-2xl font-bold fx-number" style={{ color }}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div
                    className="glass-card p-6 animate-slide-up stagger-1"
                    style={{ gridColumn: '1 / -1' }}
                >
                    <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        Equity Curve
                    </h2>
                    <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                        Account balance over time
                    </p>
                    <EquityCurve points={equityCurve} />
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-2">
                    <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        Outcome Distribution
                    </h2>
                    <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                        Trade results breakdown
                    </p>
                    <WinLossDonut win={stats.winCount} loss={stats.lossCount} be={stats.beCount} />

                    {stats.closedTrades > 0 && (
                        <div className="mt-5 pt-4 border-t grid grid-cols-2 gap-4" style={{ borderColor: 'var(--border)' }}>
                            <div>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Avg Win</p>
                                <p className="text-base font-bold fx-number" style={{ color: 'var(--fx-profit)' }}>
                                    +{formatCurrency(stats.avgWin)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Avg Loss</p>
                                <p className="text-base font-bold fx-number" style={{ color: 'var(--fx-loss)' }}>
                                    {formatCurrency(stats.avgLoss)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-3">
                    <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        Pairs Breakdown
                    </h2>
                    <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                        P&L and win rate by currency pair
                    </p>
                    <PairsBreakdown trades={allTrades} />
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-4">
                    <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        Session Performance
                    </h2>
                    <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                        Trading results by market session
                    </p>
                    <SessionBreakdown trades={allTrades} />
                </div>

                <div className="glass-card p-6 animate-slide-up stagger-5" style={{ gridColumn: '1 / -1' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} style={{ color: 'var(--fx-accent)' }} />
                        <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                            Monthly P&L
                        </h2>
                    </div>
                    <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                        Net profit/loss per month (last 12 months)
                    </p>
                    <MonthlyPL trades={allTrades} />
                </div>
            </div>

            {stats.closedTrades > 0 && (
                <div className="glass-card p-6 animate-slide-up">
                    <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                        Detailed Statistics
                    </h2>
                    <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { label: 'Total Trades', value: stats.totalTrades.toString() },
                            { label: 'Closed Trades', value: stats.closedTrades.toString() },
                            { label: 'Open Trades', value: stats.openTrades.toString() },
                            { label: 'Best Trade', value: `+${formatCurrency(stats.largestWin)}`, color: 'var(--fx-profit)' },
                            { label: 'Worst Trade', value: formatCurrency(stats.largestLoss), color: 'var(--fx-loss)' },
                            { label: 'Total Pips', value: `${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips.toFixed(1)}`, color: stats.totalPips >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)' },
                            { label: 'Best Pair', value: stats.bestPair ?? '—', color: 'var(--fx-gold)' },
                            { label: 'Worst Pair', value: stats.worstPair ?? '—', color: 'var(--fx-loss)' },
                            { label: 'Best Session', value: stats.bestSession?.replace('_', ' ') ?? '—', color: 'var(--fx-accent)' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                                <span className="text-sm font-bold fx-number" style={{ color: color || 'var(--foreground)' }}>
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
                    style={{ border: '2px dashed var(--border)', background: 'var(--muted)' }}
                >
                    <BarChart3 size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Log some trades to see your analytics.
                    </p>
                </div>
            )}
        </div>
    );
}
