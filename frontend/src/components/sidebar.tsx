'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from '@/lib/account-context';
import { formatCurrency, calculatePortfolioGain } from '@/lib/portfolio-utils';
import {
    LayoutDashboard,
    ScrollText,
    BarChart3,
    TrendingUp,
    TrendingDown,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Check,
    Settings,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/trades', label: 'Trade Log', icon: ScrollText },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

const ACCOUNT_TYPE_COLOR: Record<string, string> = {
    LIVE: '#10b981',
    DEMO: '#7b8fa8',
    PROP: '#f59e0b',
};

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const pathname = usePathname();

    const { portfolios, activePortfolio, setSelectedPortfolioId, isLoading } = useAccount();

    const sidebarWidth = collapsed ? 64 : 224;

    const { gain, gainPercent } = activePortfolio
        ? calculatePortfolioGain(activePortfolio)
        : { gain: 0, gainPercent: 0 };
    const isProfit = gain >= 0;

    return (
        <>
            <div
                style={{
                    width: sidebarWidth,
                    minHeight: '100vh',
                    background: '#09111f',
                    borderRight: '1px solid #1e2636',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 40,
                    transition: 'width 0.25s ease',
                    overflow: 'hidden',
                }}
            >
                {/* ── Logo ─────────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '18px 16px',
                    borderBottom: '1px solid #1e2636',
                    minHeight: 64,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: 'linear-gradient(135deg, #00d4ff, #0099bb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 0 14px rgba(0,212,255,0.4)',
                    }}>
                        <TrendingUp size={17} color="#0b0f1a" strokeWidth={2.5} />
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                                FX Journal
                            </p>
                            <p style={{ color: '#7b8fa8', fontSize: 11, whiteSpace: 'nowrap' }}>
                                FOREX Trading
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Account Switcher ──────────────────────────────────── */}
                {!isLoading && portfolios.length > 0 && (
                    <div style={{
                        borderBottom: '1px solid #1e2636',
                        position: 'relative',
                    }}>
                        <button
                            onClick={() => !collapsed && setSwitcherOpen(o => !o)}
                            title={collapsed ? activePortfolio?.name : undefined}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                cursor: collapsed ? 'default' : 'pointer',
                                padding: collapsed ? '12px 0' : '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                justifyContent: collapsed ? 'center' : 'space-between',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (!collapsed) (e.currentTarget as HTMLButtonElement).style.background = '#111827';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            }}
                        >
                            {/* Colored dot = account type indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                    background: ACCOUNT_TYPE_COLOR[activePortfolio?.accountType ?? 'DEMO'],
                                    boxShadow: `0 0 6px ${ACCOUNT_TYPE_COLOR[activePortfolio?.accountType ?? 'DEMO']}`,
                                }} />
                                {!collapsed && (
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{
                                            color: '#e2e8f0', fontSize: 12, fontWeight: 600,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            margin: 0, lineHeight: 1.3,
                                        }}>
                                            {activePortfolio?.name ?? 'Select account'}
                                        </p>
                                        {activePortfolio && (
                                            <p style={{
                                                margin: 0, fontSize: 11, lineHeight: 1.3,
                                                color: isProfit ? '#10b981' : '#ef4444',
                                                fontFamily: 'var(--fx-font-mono)',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {formatCurrency(activePortfolio.currentBalance, activePortfolio.currency)}
                                                <span style={{ opacity: 0.75, marginLeft: 5 }}>
                                                    {gain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            {!collapsed && (
                                <ChevronDown
                                    size={14}
                                    style={{
                                        color: '#7b8fa8', flexShrink: 0,
                                        transform: switcherOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                            )}
                        </button>

                        {/* Dropdown list */}
                        {switcherOpen && !collapsed && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 8, right: 8,
                                background: '#111827',
                                border: '1px solid #1e2636',
                                borderRadius: 10,
                                overflow: 'hidden',
                                zIndex: 50,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            }}>
                                {portfolios.map(p => {
                                    const { gain: pGain, gainPercent: pPct } = calculatePortfolioGain(p);
                                    const isActive = p.id === activePortfolio?.id;
                                    const dotColor = ACCOUNT_TYPE_COLOR[p.accountType] ?? '#7b8fa8';
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPortfolioId(p.id);
                                                setSwitcherOpen(false);
                                            }}
                                            style={{
                                                width: '100%', border: 'none', cursor: 'pointer',
                                                background: isActive ? 'rgba(0,212,255,0.07)' : 'transparent',
                                                padding: '10px 12px',
                                                display: 'flex', alignItems: 'center', gap: 9,
                                                textAlign: 'left',
                                                borderBottom: '1px solid #1e2636',
                                                transition: 'background 0.12s',
                                            }}
                                            onMouseEnter={e => {
                                                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                                            }}
                                            onMouseLeave={e => {
                                                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                            }}
                                        >
                                            <div style={{
                                                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                                background: dotColor,
                                            }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    color: isActive ? '#00d4ff' : '#e2e8f0',
                                                    fontSize: 12, fontWeight: 600, margin: 0,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {p.name}
                                                </p>
                                                <p style={{
                                                    margin: 0, fontSize: 10,
                                                    color: pGain >= 0 ? '#10b981' : '#ef4444',
                                                    fontFamily: 'var(--fx-font-mono)',
                                                }}>
                                                    {formatCurrency(p.currentBalance, p.currency)}
                                                    <span style={{ opacity: 0.7, marginLeft: 4 }}>
                                                        {pGain >= 0 ? '+' : ''}{pPct.toFixed(1)}%
                                                    </span>
                                                </p>
                                            </div>
                                            {isActive && (
                                                <Check size={13} style={{ color: '#00d4ff', flexShrink: 0 }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Nav items ────────────────────────────────────────── */}
                <nav style={{ flex: 1, padding: '12px 0' }}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSwitcherOpen(false)}
                                title={collapsed ? item.label : undefined}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 14px',
                                    margin: '2px 8px',
                                    borderRadius: 8,
                                    color: isActive ? '#00d4ff' : '#7b8fa8',
                                    background: isActive ? 'rgba(0,212,255,0.10)' : 'transparent',
                                    border: isActive ? '1px solid rgba(0,212,255,0.18)' : '1px solid transparent',
                                    textDecoration: 'none',
                                    fontSize: 13.5,
                                    fontWeight: isActive ? 600 : 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <Icon
                                    size={18}
                                    style={{ flexShrink: 0, color: isActive ? '#00d4ff' : '#7b8fa8' }}
                                    strokeWidth={isActive ? 2 : 1.75}
                                />
                                {!collapsed && (
                                    <span>{item.label}</span>
                                )}
                                {isActive && !collapsed && (
                                    <div style={{
                                        marginLeft: 'auto',
                                        width: 6, height: 6, borderRadius: '50%',
                                        background: '#00d4ff', flexShrink: 0,
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Collapse toggle ───────────────────────────────────── */}
                <div style={{ padding: '12px 0', borderTop: '1px solid #1e2636' }}>
                    <button
                        onClick={() => { setCollapsed(!collapsed); setSwitcherOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 14px', margin: '0 8px', borderRadius: 8,
                            color: '#7b8fa8', background: 'transparent',
                            border: '1px solid transparent', cursor: 'pointer',
                            fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap',
                            width: 'calc(100% - 16px)', textAlign: 'left',
                            transition: 'all 0.15s ease',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = '#1e2636';
                            (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            (e.currentTarget as HTMLButtonElement).style.color = '#7b8fa8';
                        }}
                    >
                        {collapsed
                            ? <ChevronRight size={18} strokeWidth={1.75} />
                            : <>
                                <ChevronLeft size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                                <span>Collapse</span>
                              </>
                        }
                    </button>
                </div>
            </div>

            {/* Spacer */}
            <div style={{ width: sidebarWidth, flexShrink: 0, transition: 'width 0.25s ease' }} />
        </>
    );
}
