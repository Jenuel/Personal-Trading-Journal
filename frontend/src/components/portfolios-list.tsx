'use client';

import Link from 'next/link';
import { Portfolio } from '@/types/types';
import { formatCurrency, calculatePortfolioGain, calculateFxStats } from '@/lib/portfolio-utils';
import { TrendingUp, TrendingDown, ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface PortfoliosListProps {
    portfolios: Portfolio[];
    onEdit: (portfolio: Portfolio) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

const ACCOUNT_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
    LIVE: { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
    DEMO: { bg: 'rgba(122,154,184,0.12)', color: '#7a9ab8' },
    PROP: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
};

export function PortfoliosList({ portfolios, onEdit, onDelete, isDeleting }: PortfoliosListProps) {
    if (!portfolios || portfolios.length === 0) {
        return (
            <div style={{
                borderRadius: 14, padding: '64px 32px', textAlign: 'center',
                background: '#0d1524',
            }}>
                <TrendingUp size={36} style={{ color: '#3a5c7a', margin: '0 auto 12px' }} />
                <p style={{ color: '#4a6080', fontSize: 14, margin: 0 }}>
                    No trading accounts yet. Create one to start tracking your FOREX trades.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {portfolios.map((portfolio) => {
                const { gain, gainPercent } = calculatePortfolioGain(portfolio);
                const trades = portfolio.trades ?? [];
                const stats = calculateFxStats(trades);
                const typeStyle = ACCOUNT_TYPE_STYLE[portfolio.accountType] ?? ACCOUNT_TYPE_STYLE.DEMO;
                const isProfit = gain >= 0;

                return (
                    <div
                        key={portfolio.id}
                        style={{
                            background: '#0d1524',
                            borderRadius: 14,
                            padding: 20,
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.background = '#111d30';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.background = '#0d1524';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                                        background: typeStyle.bg, color: typeStyle.color,
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                    }}>
                                        {portfolio.accountType}
                                    </span>
                                    <span style={{ color: '#4a6080', fontSize: 12 }}>{portfolio.currency}</span>
                                </div>
                                <h3 style={{ color: '#c8ddef', fontWeight: 700, fontSize: 15, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {portfolio.name}
                                </h3>
                                {portfolio.broker && (
                                    <p style={{ color: '#4a6080', fontSize: 12, margin: '2px 0 0' }}>{portfolio.broker}</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                                <button
                                    onClick={() => onEdit(portfolio)}
                                    style={{ background: '#111d30', border: 'none', cursor: 'pointer', color: '#7aA8cc', padding: '6px', borderRadius: 6 }}
                                    title="Edit"
                                >
                                    <Pencil size={13} />
                                </button>
                                <button
                                    onClick={() => onDelete(portfolio.id)}
                                    disabled={isDeleting}
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', color: '#f87171', padding: '6px', borderRadius: 6 }}
                                    title="Delete"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <p style={{ color: '#3a5c7a', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 2px' }}>Balance</p>
                            <p style={{ color: '#c8ddef', fontSize: 22, fontWeight: 700, fontFamily: 'var(--fx-font-mono)', letterSpacing: '-0.02em', margin: 0 }}>
                                {formatCurrency(portfolio.currentBalance, portfolio.currency)}
                            </p>
                        </div>

                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            borderRadius: 8, padding: '10px 12px', marginBottom: 12,
                            background: isProfit ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {isProfit
                                    ? <TrendingUp size={14} color="#10b981" />
                                    : <TrendingDown size={14} color="#ef4444" />
                                }
                                <span style={{ color: '#4a6080', fontSize: 12 }}>P&L</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    color: isProfit ? '#10b981' : '#ef4444',
                                    fontFamily: 'var(--fx-font-mono)',
                                    fontWeight: 700, fontSize: 14,
                                }}>
                                    {gain >= 0 ? '+' : ''}{formatCurrency(gain, portfolio.currency)}
                                </span>
                                <span style={{
                                    color: isProfit ? '#10b981' : '#ef4444',
                                    fontFamily: 'var(--fx-font-mono)',
                                    fontSize: 12, opacity: 0.8, marginLeft: 6,
                                }}>
                                    ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>

                        {trades.length > 0 && (
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                                background: '#0b1220', borderRadius: 8, padding: '8px 0', marginBottom: 14,
                            }}>
                                {[
                                    { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, color: stats.winRate >= 50 ? '#10b981' : '#ef4444' },
                                    { label: 'PF', value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1 ? '#10b981' : '#ef4444' },
                                    { label: 'Trades', value: stats.closedTrades.toString(), color: '#c8ddef' },
                                ].map(({ label, value, color }, i) => (
                                    <div key={label} style={{
                                        textAlign: 'center',
                                        borderRight: i < 2 ? '1px solid rgba(74,96,128,0.1)' : 'none',
                                    }}>
                                        <p style={{ color: '#3a5c7a', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px', fontWeight: 600 }}>{label}</p>
                                        <p style={{ color, fontFamily: 'var(--fx-font-mono)', fontWeight: 700, fontSize: 13, margin: 0 }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            href={`/portfolios/${portfolio.id}`}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                width: '100%', padding: '9px 0', borderRadius: 8,
                                color: '#c8d8ec', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                                background: '#1a2d47',
                                transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = '#223b5d';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = '#1a2d47';
                            }}
                        >
                            View Account <ExternalLink size={12} />
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
