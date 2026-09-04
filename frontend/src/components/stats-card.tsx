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
    accentColor = '#00d4ff',
    className = '',
}: StatsCardProps) {
    const changeColor =
        changeType === 'positive' ? '#10b981' :
        changeType === 'negative' ? '#ef4444' :
        '#7b8fa8';

    return (
        <div
            className={`animate-slide-up ${className}`}
            style={{
                background: '#141824',
                border: `1px solid #2a3347`,
                borderTop: `2px solid ${accentColor}`,
                borderRadius: '12px',
                padding: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = '';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#7b8fa8',
                }}>
                    {label}
                </span>
                {icon && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px',
                        borderRadius: '8px',
                        background: `${accentColor}18`,
                        color: accentColor,
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
                    letterSpacing: '-0.03em',
                    color: '#e2e8f0',
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
                <p style={{ fontSize: '12px', color: '#7b8fa8', margin: 0 }}>
                    {subtext}
                </p>
            )}
        </div>
    );
}
