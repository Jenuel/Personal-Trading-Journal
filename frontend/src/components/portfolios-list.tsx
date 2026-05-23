'use client';

import Link from 'next/link';
import { Portfolio } from '@/types/types';
import { formatCurrency } from '@/lib/portfolio-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface PortfoliosListProps {
    portfolios: Portfolio[];
    onEdit?: (portfolio: Portfolio) => void;
    onDelete?: (id: string) => void;
    isDeleting?: boolean;
}

export function PortfoliosList({
    portfolios,
    onEdit,
    onDelete,
    isDeleting,
}: PortfoliosListProps) {
    if (!portfolios || portfolios.length === 0) {
        return (
            <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
                No portfolios yet. Create one to get started.
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((portfolio) => {
                const gainPercent =
                    portfolio.initialBalance > 0
                        ? ((portfolio.currentBalance - portfolio.initialBalance) /
                            portfolio.initialBalance) *
                        100
                        : 0;
                const gain = portfolio.currentBalance - portfolio.initialBalance;

                return (
                    <Card key={portfolio.id} className="flex flex-col gap-4 p-4">
                        <div>
                            <h3 className="font-semibold">{portfolio.name}</h3>
                            {portfolio.description && (
                                <p className="text-sm text-muted-foreground">
                                    {portfolio.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 border-t border-border pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Balance</span>
                                <span className="font-mono font-semibold">
                                    {formatCurrency(portfolio.currentBalance)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gain</span>
                                <span
                                    className={`font-mono font-semibold ${gain >= 0 ? 'trading-positive' : 'trading-negative'
                                        }`}
                                >
                                    {formatCurrency(gain)} ({gainPercent.toFixed(2)}%)
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Initial</span>
                                <span className="font-mono font-semibold">
                                    {formatCurrency(portfolio.initialBalance)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 border-t border-border pt-4">
                            <Link
                                href={`/portfolios/${portfolio.id}`}
                                className="flex-1"
                            >
                                <Button variant="outline" className="w-full">
                                    View Details
                                </Button>
                            </Link>
                            {onEdit && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(portfolio)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(portfolio.id)}
                                    disabled={isDeleting}
                                    className="text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
