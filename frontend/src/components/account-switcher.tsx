'use client';

import { Portfolio } from '@/types/types';
import { formatCurrency, calculatePortfolioGain, calculateFxStats } from '@/lib/portfolio-utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ACCOUNT_TYPE_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
    LIVE: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', dot: '#34d399' },
    DEMO: { bg: 'rgba(122,154,184,0.12)', color: '#7a9ab8', dot: '#7a9ab8' },
    PROP: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' },
};

interface AccountSwitcherStripProps {
    portfolios: Portfolio[];
    activeId: string;
    onSelect: (id: string) => void;
}

export function AccountSwitcherStrip({ portfolios, activeId, onSelect }: AccountSwitcherStripProps) {
    if (!portfolios || portfolios.length === 0) return null;

    return (
        <div style={{ position: 'relative' }}>
            {/* Scrollable strip */}
            <div style={{
                display: 'flex',
                gap: 12,
                overflowX: 'auto',
                paddingBottom: 4,
                scrollbarWidth: 'none',
            }}>
                {portfolios.map((portfolio) => {
                    const isActive = portfolio.id === activeId;
                    const { gain, gainPercent } = calculatePortfolioGain(portfolio);
                    const stats = calculateFxStats(portfolio.trades ?? []);
                    const typeStyle = ACCOUNT_TYPE_STYLE[portfolio.accountType] ?? ACCOUNT_TYPE_STYLE.DEMO;
                    const isProfit = gain >= 0;

                    return (
                        <button
                            key={portfolio.id}
                            onClick={() => onSelect(portfolio.id)}
                            style={{
                                flexShrink: 0,
                                width: 220,
                                background: isActive ? '#162438' : '#0d1524',
                                border: 'none',
                                borderRadius: 12,
                                padding: '14px 16px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLButtonElement).style.background = '#111d30';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLButtonElement).style.background = '#0d1524';
                                }
                            }}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 2,
                                    background: '#7aA8cc',
                                    borderRadius: '12px 12px 0 0',
                                }} />
                            )}

                            {/* Header row: type badge + dot */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                                    background: typeStyle.bg, color: typeStyle.color,
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                                    {portfolio.accountType}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{
                                        width: 6, height: 6, borderRadius: '50%',
                                        background: typeStyle.dot,
                                    }} />
                                    <span style={{ color: '#4a6080', fontSize: 11 }}>{portfolio.currency}</span>
                                </div>
                            </div>

                            {/* Account name */}
                            <p style={{
                                color: isActive ? '#dce8f5' : '#c8ddef',
                                fontWeight: 700, fontSize: 13,
                                margin: '0 0 2px',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {portfolio.name}
                            </p>

                            {/* Broker */}
                            {portfolio.broker && (
                                <p style={{ color: '#4a6080', fontSize: 11, margin: '0 0 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {portfolio.broker}
                                </p>
                            )}
                            {!portfolio.broker && <div style={{ height: 10, marginBottom: 10 }} />}

                            {/* Balance */}
                            <p style={{
                                color: '#c8ddef',
                                fontFamily: 'var(--fx-font-mono)',
                                fontWeight: 700, fontSize: 16,
                                letterSpacing: '-0.02em',
                                margin: '0 0 6px',
                            }}>
                                {formatCurrency(portfolio.currentBalance, portfolio.currency)}
                            </p>

                            {/* P&L row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {isProfit
                                        ? <TrendingUp size={11} color="#10b981" />
                                        : <TrendingDown size={11} color="#ef4444" />
                                    }
                                    <span style={{
                                        color: isProfit ? '#10b981' : '#ef4444',
                                        fontFamily: 'var(--fx-font-mono)',
                                        fontSize: 12, fontWeight: 600,
                                    }}>
                                        {gain >= 0 ? '+' : ''}{formatCurrency(gain, portfolio.currency)}
                                    </span>
                                    <span style={{
                                        color: isProfit ? '#10b981' : '#ef4444',
                                        fontFamily: 'var(--fx-font-mono)',
                                        fontSize: 11, opacity: 0.75,
                                    }}>
                                        ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                                    </span>
                                </div>
                                <span style={{ color: '#4a6080', fontSize: 11 }}>
                                    {stats.closedTrades}t
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
