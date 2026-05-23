'use client';

import { Card } from '@/components/ui/card';

interface StatsCardProps {
    label: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    subtext?: string;
}

export function StatsCard({
    label,
    value,
    change,
    changeType = 'neutral',
    subtext,
}: StatsCardProps) {
    return (
        <Card className="p-4">
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="font-mono text-2xl font-bold">{value}</p>
                {change && (
                    <p
                        className={`text-sm font-mono ${changeType === 'positive'
                                ? 'trading-positive'
                                : changeType === 'negative'
                                    ? 'trading-negative'
                                    : 'trading-neutral'
                            }`}
                    >
                        {changeType === 'positive' && '+'}
                        {change}
                    </p>
                )}
                {subtext && (
                    <p className="text-xs text-muted-foreground">{subtext}</p>
                )}
            </div>
        </Card>
    );
}
