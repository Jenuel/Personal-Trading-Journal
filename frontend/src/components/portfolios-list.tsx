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
    LIVE: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    DEMO: { bg: 'rgba(123,143,168,0.15)', color: '#7b8fa8' },
    PROP: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
};

export function PortfoliosList({ portfolios, onEdit, onDelete, isDeleting }: PortfoliosListProps) {
    if (!portfolios || portfolios.length === 0) {
        return (
            <div style={{
                borderRadius: 16, padding: '64px 32px', textAlign: 'center',
                border: '2px dashed #2a3347', background: '#141824',
            }}>
                <TrendingUp size={36} style={{ color: '#2a3347', margin: '0 auto 12px' }} />
                <p style={{ color: '#7b8fa8', fontSize: 14, margin: 0 }}>
                    No trading accounts yet. Create one to start tracking your FOREX trades.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
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
                            background: '#141824',
                            border: '1px solid #2a3347',
                            borderRadius: 12,
                            padding: 20,
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.3)';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 24px rgba(0,212,255,0.07)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = '#2a3347';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                        background: typeStyle.bg, color: typeStyle.color,
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>
                                        {portfolio.accountType}
                                    </span>
                                    <span style={{ color: '#7b8fa8', fontSize: 12 }}>{portfolio.currency}</span>
                                </div>
                                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {portfolio.name}
                                </h3>
                                {portfolio.broker && (
                                    <p style={{ color: '#7b8fa8', fontSize: 12, margin: '2px 0 0' }}>{portfolio.broker}</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
                                <button
                                    onClick={() => onEdit(portfolio)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b8fa8', padding: '4px 6px', borderRadius: 6 }}
                                    title="Edit"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => onDelete(portfolio.id)}
                                    disabled={isDeleting}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: '4px 6px', borderRadius: 6 }}
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <p style={{ color: '#7b8fa8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Balance</p>
                            <p style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, fontFamily: 'var(--fx-font-mono)', letterSpacing: '-0.02em', margin: 0 }}>
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
                                <span style={{ color: '#7b8fa8', fontSize: 12 }}>P&L</span>
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
                                background: '#1a2030', borderRadius: 8, padding: '8px 0', marginBottom: 14,
                            }}>
                                {[
                                    { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, color: stats.winRate >= 50 ? '#10b981' : '#ef4444' },
                                    { label: 'PF', value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1 ? '#10b981' : '#ef4444' },
                                    { label: 'Trades', value: stats.closedTrades.toString(), color: '#e2e8f0' },
                                ].map(({ label, value, color }, i) => (
                                    <div key={label} style={{
                                        textAlign: 'center',
                                        borderRight: i < 2 ? '1px solid #2a3347' : 'none',
                                    }}>
                                        <p style={{ color: '#7b8fa8', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>{label}</p>
                                        <p style={{ color, fontFamily: 'var(--fx-font-mono)', fontWeight: 700, fontSize: 14, margin: 0 }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            href={`/portfolios/${portfolio.id}`}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                width: '100%', padding: '8px 0', borderRadius: 8,
                                color: '#00d4ff', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                                border: '1px solid rgba(0,212,255,0.2)',
                                transition: 'background 0.15s',
                            }}
                        >
                            View Account <ExternalLink size={11} />
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
