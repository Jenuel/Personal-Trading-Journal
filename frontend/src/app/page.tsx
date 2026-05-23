'use client';

import { useMemo } from 'react';
import Nav from '@/components/nav';
import { StatsCard } from '@/components/stats-card';
import { usePortfolios } from '@/hooks/use-portfolios';
import { formatCurrency, formatPercent } from '@/lib/portfolio-utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: portfolios, isLoading, error } = usePortfolios();

  // Get all trades across all portfolios
  const allTrades = useMemo(() => {
    if (!portfolios) return [];
    return portfolios.flatMap((p) => p.id);
  }, [portfolios]);

  const stats = useMemo(() => {
    if (!portfolios) return null;

    let totalInitial = 0;
    let totalCurrent = 0;
    let totalGain = 0;
    let totalGainPercent = 0;

    portfolios.forEach((portfolio) => {
      totalInitial += portfolio.initialBalance;
      totalCurrent += portfolio.currentBalance;
      totalGain += portfolio.currentBalance - portfolio.initialBalance;
    });

    if (totalInitial > 0) {
      totalGainPercent = (totalGain / totalInitial) * 100;
    }

    return {
      portfolioCount: portfolios.length,
      totalValue: totalCurrent,
      totalGain,
      totalGainPercent,
      averageGainPercent: totalInitial > 0 ? totalGainPercent : 0,
    };
  }, [portfolios]);

  if (error) {
    return (
      <div>
        <Nav />
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading Portfolios</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Nav />
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {stats?.portfolioCount || 0} portfolio
            {stats?.portfolioCount !== 1 ? 's' : ''}
          </p>
        </div>

        {stats && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                label="Total Value"
                value={formatCurrency(stats.totalValue)}
                subtext="Current balance across all portfolios"
              />
              <StatsCard
                label="Total Gain/Loss"
                value={formatCurrency(stats.totalGain)}
                change={formatPercent(stats.totalGainPercent)}
                changeType={
                  stats.totalGain >= 0 ? 'positive' : 'negative'
                }
                subtext="From initial investment"
              />
              <StatsCard
                label="Portfolios"
                value={stats.portfolioCount.toString()}
                subtext="Active trading accounts"
              />
              <StatsCard
                label="Avg Return"
                value={formatPercent(stats.averageGainPercent)}
                changeType={
                  stats.averageGainPercent >= 0 ? 'positive' : 'negative'
                }
                subtext="Average return percentage"
              />
            </div>

            {portfolios && portfolios.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Portfolios Overview</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {portfolios.map((portfolio) => {
                    const gain = portfolio.currentBalance - portfolio.initialBalance;
                    const gainPercent =
                      portfolio.initialBalance > 0
                        ? (gain / portfolio.initialBalance) * 100
                        : 0;

                    return (
                      <Card key={portfolio.id} className="p-4">
                        <h3 className="font-semibold">{portfolio.name}</h3>
                        <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Balance</span>
                            <span className="font-mono">
                              {formatCurrency(portfolio.currentBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gain/Loss</span>
                            <span
                              className={`font-mono ${gain >= 0
                                  ? 'trading-positive'
                                  : 'trading-negative'
                                }`}
                            >
                              {formatCurrency(gain)} ({gainPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No portfolios yet. Create one to start tracking your trades.
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
