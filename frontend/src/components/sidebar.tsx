'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    ScrollText,
    BarChart3,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portfolios', label: 'Accounts', icon: Briefcase },
    { href: '/trades', label: 'Trade Log', icon: ScrollText },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const sidebarWidth = collapsed ? 64 : 220;

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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '18px 16px',
                    borderBottom: '1px solid #1e2636',
                    minHeight: 64,
                    overflow: 'hidden',
                }}>
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: 'linear-gradient(135deg, #00d4ff, #0099bb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 0 14px rgba(0,212,255,0.4)',
                        }}
                    >
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

                <nav style={{ flex: 1, padding: '12px 0' }}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
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
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#00d4ff',
                                        flexShrink: 0,
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '12px 0', borderTop: '1px solid #1e2636' }}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 14px',
                            margin: '0 8px',
                            borderRadius: 8,
                            color: '#7b8fa8',
                            background: 'transparent',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            fontSize: 13.5,
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            width: 'calc(100% - 16px)',
                            textAlign: 'left',
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

            {/* Spacer to push main content right */}
            <div style={{
                width: sidebarWidth,
                flexShrink: 0,
                transition: 'width 0.25s ease',
            }} />
        </>
    );
}
