import { Trade, Position, CashTransaction } from '@/types/types';

export interface CostBatch {
    quantity: number;
    costPerShare: number;
    date: string;
}

export interface MatchedSale {
    quantity: number;
    costBasis: number;
    salePrice: number;
    realizedPL: number;
}

export function calculatePortfolioPL(
    trades: Trade[],
    cashTransactions: CashTransaction[] = [],
    initialBalance: number = 0,
    currentBalance: number = 0
) {
    // Group trades by symbol
    const tradesBySymbol = trades.reduce(
        (acc, trade) => {
            if (!acc[trade.symbol]) {
                acc[trade.symbol] = [];
            }
            acc[trade.symbol].push(trade);
            return acc;
        },
        {} as Record<string, Trade[]>
    );

    let totalRealizedPL = 0;
    const positions: Position[] = [];

    // Process each symbol
    for (const symbol in tradesBySymbol) {
        const symbolTrades = tradesBySymbol[symbol].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const buyCostBatches: CostBatch[] = [];
        let totalQuantity = 0;

        for (const trade of symbolTrades) {
            if (trade.type === 'BUY') {
                buyCostBatches.push({
                    quantity: trade.quantity,
                    costPerShare: trade.price,
                    date: trade.date,
                });
                totalQuantity += trade.quantity;
            } else if (trade.type === 'SELL') {
                // Match against cost batches (FIFO)
                let quantityToSell = trade.quantity;
                let sellRealized = 0;

                while (quantityToSell > 0 && buyCostBatches.length > 0) {
                    const batch = buyCostBatches[0];

                    if (batch.quantity <= quantityToSell) {
                        // Sell entire batch
                        const costBasis = batch.quantity * batch.costPerShare;
                        const saleValue = batch.quantity * trade.price;
                        sellRealized += saleValue - costBasis;
                        quantityToSell -= batch.quantity;
                        totalQuantity -= batch.quantity;
                        buyCostBatches.shift();
                    } else {
                        // Partial sale from batch
                        const costBasis = quantityToSell * batch.costPerShare;
                        const saleValue = quantityToSell * trade.price;
                        sellRealized += saleValue - costBasis;
                        batch.quantity -= quantityToSell;
                        totalQuantity -= quantityToSell;
                        quantityToSell = 0;
                    }
                }

                totalRealizedPL += sellRealized;
            }
        }

        // If there are remaining shares, calculate unrealized P/L
        if (totalQuantity > 0 && buyCostBatches.length > 0) {
            const averageCost =
                buyCostBatches.reduce((sum, batch) => sum + batch.quantity * batch.costPerShare, 0) /
                totalQuantity;

            // Use last trade price as current price (placeholder)
            const lastTrade = symbolTrades[symbolTrades.length - 1];
            const currentPrice = lastTrade.price;

            const unrealizedPL = totalQuantity * (currentPrice - averageCost);
            const unrealizedPLPercent = ((currentPrice - averageCost) / averageCost) * 100;

            positions.push({
                symbol,
                quantity: totalQuantity,
                averageCost,
                currentPrice,
                unrealizedPL,
                unrealizedPLPercent,
            });
        }
    }

    // Calculate portfolio totals
    const totalCashFlows = cashTransactions.reduce((sum, tx) => {
        return sum + (tx.type === 'DEPOSIT' ? tx.amount : -tx.amount);
    }, initialBalance);

    const unrealizedPL = positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
    const totalGain = totalRealizedPL + unrealizedPL;
    const totalGainPercent = totalCashFlows > 0 ? (totalGain / totalCashFlows) * 100 : 0;

    return {
        positions,
        totalRealizedPL,
        unrealizedPL,
        totalGain,
        totalGainPercent,
        availableCash: currentBalance - positions.reduce((sum, pos) => sum + pos.quantity * pos.currentPrice, 0),
    };
}

export function calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0;

    const sells = trades.filter((t) => t.type === 'SELL');
    if (sells.length === 0) return 0;

    // Group by symbol and calculate P/L for each symbol
    const symbolTrades: Record<string, Trade[]> = {};
    trades.forEach((trade) => {
        if (!symbolTrades[trade.symbol]) {
            symbolTrades[trade.symbol] = [];
        }
        symbolTrades[trade.symbol].push(trade);
    });

    let winCount = 0;
    let totalTrades = 0;

    for (const symbol in symbolTrades) {
        const trades = symbolTrades[symbol].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const buyCostBatches: CostBatch[] = [];

        for (const trade of trades) {
            if (trade.type === 'BUY') {
                buyCostBatches.push({
                    quantity: trade.quantity,
                    costPerShare: trade.price,
                    date: trade.date,
                });
            } else if (trade.type === 'SELL') {
                let quantityToSell = trade.quantity;

                while (quantityToSell > 0 && buyCostBatches.length > 0) {
                    const batch = buyCostBatches[0];
                    const sellQuantity = Math.min(batch.quantity, quantityToSell);
                    const costBasis = sellQuantity * batch.costPerShare;
                    const saleValue = sellQuantity * trade.price;

                    if (saleValue > costBasis) {
                        winCount++;
                    }
                    totalTrades++;

                    batch.quantity -= sellQuantity;
                    quantityToSell -= sellQuantity;

                    if (batch.quantity === 0) {
                        buyCostBatches.shift();
                    }
                }
            }
        }
    }

    return totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}
