'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    subtext?: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: ReactNode;
    accentColor?: string;
    className?: string;
}

export function StatsCard({
    label,
    value,
    subtext,
    change,
    changeType,
    icon,
    accentColor = '#7aA8cc',
    className = '',
}: StatsCardProps) {
    const changeColor =
        changeType === 'positive' ? '#10b981' :
        changeType === 'negative' ? '#ef4444' :
        '#4a6080';

    return (
        <div
            className={`animate-slide-up ${className}`}
            style={{
                background: '#0d1524',
                borderRadius: '12px',
                padding: '20px',
                transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#101a2c';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#0d1524';
                (e.currentTarget as HTMLDivElement).style.transform = '';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#3a5c7a',
                }}>
                    {label}
                </span>
                {icon && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '28px', height: '28px',
                        borderRadius: '7px',
                        background: 'rgba(90, 120, 150, 0.10)',
                        color: accentColor,
                        flexShrink: 0,
                    }}>
                        {icon}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '6px' }}>
                <span style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'var(--fx-font-mono)',
                    letterSpacing: '-0.025em',
                    color: '#c8ddef',
                }}>
                    {value}
                </span>
                {change && (
                    <span style={{
                        marginLeft: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'var(--fx-font-mono)',
                        color: changeColor,
                    }}>
                        {change}
                    </span>
                )}
            </div>

            {subtext && (
                <p style={{ fontSize: '12px', color: '#4a6080', margin: 0, lineHeight: 1.5 }}>
                    {subtext}
                </p>
            )}
        </div>
    );
}
