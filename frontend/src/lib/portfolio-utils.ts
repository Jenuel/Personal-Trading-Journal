import { ForexTrade, Portfolio, CashTransaction, AccountCurrency } from '@/types/types';

const CURRENCY_LOCALES: Record<AccountCurrency, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    AUD: 'en-AU',
    CAD: 'en-CA',
    CHF: 'de-CH',
    NZD: 'en-NZ',
};

export function formatCurrency(value: number, currency: AccountCurrency = 'USD'): string {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency] || 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

export function formatPips(pips: number): string {
    const sign = pips > 0 ? '+' : '';
    return `${sign}${pips.toFixed(1)} pips`;
}

export function formatRR(rr: number): string {
    if (rr === 0) return 'BE';
    const sign = rr > 0 ? '+' : '';
    return `${sign}${rr.toFixed(2)}R`;
}

export function formatPrice(price: number, pair: string = ''): string {
    const isJPY = pair.includes('JPY') || pair.includes('XAU') || pair.includes('XAG');
    const decimals = isJPY ? 3 : 5;
    return price.toFixed(decimals);
}

export interface FxStats {
    totalTrades: number;
    closedTrades: number;
    openTrades: number;
    winCount: number;
    lossCount: number;
    beCount: number;
    winRate: number;
    totalPL: number;
    totalPips: number;
    profitFactor: number;
    avgRR: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    bestPair: string | null;
    worstPair: string | null;
    bestSession: string | null;
}

export function calculateFxStats(trades: ForexTrade[]): FxStats {
    const closed = trades.filter(t => t.exitPrice !== undefined && t.outcome !== undefined);
    const wins = closed.filter(t => t.outcome === 'WIN');
    const losses = closed.filter(t => t.outcome === 'LOSS');
    const bes = closed.filter(t => t.outcome === 'BE');

    const totalPL = closed.reduce((sum, t) => sum + (t.result ?? 0), 0);
    const totalPips = closed.reduce((sum, t) => sum + (t.pips ?? 0), 0);

    const grossProfit = wins.reduce((sum, t) => sum + (t.result ?? 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.result ?? 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    const avgRR = closed.length > 0
        ? closed.reduce((sum, t) => sum + (t.rr ?? 0), 0) / closed.length
        : 0;

    const avgWin = wins.length > 0
        ? wins.reduce((sum, t) => sum + (t.result ?? 0), 0) / wins.length
        : 0;

    const avgLoss = losses.length > 0
        ? losses.reduce((sum, t) => sum + (t.result ?? 0), 0) / losses.length
        : 0;

    const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.result ?? 0)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.result ?? 0)) : 0;

    const plByPair: Record<string, number> = {};
    closed.forEach(t => {
        plByPair[t.pair] = (plByPair[t.pair] ?? 0) + (t.result ?? 0);
    });

    const pairs = Object.entries(plByPair).sort((a, b) => b[1] - a[1]);
    const bestPair = pairs.length > 0 ? pairs[0][0] : null;
    const worstPair = pairs.length > 1 ? pairs[pairs.length - 1][0] : null;

    const sessionWins: Record<string, { w: number; t: number }> = {};
    closed.forEach(t => {
        if (!t.session) return;
        if (!sessionWins[t.session]) sessionWins[t.session] = { w: 0, t: 0 };
        sessionWins[t.session].t++;
        if (t.outcome === 'WIN') sessionWins[t.session].w++;
    });

    const sessions = Object.entries(sessionWins)
        .map(([k, v]) => ({ session: k, wr: v.w / v.t }))
        .sort((a, b) => b.wr - a.wr);
    const bestSession = sessions.length > 0 ? sessions[0].session : null;

    return {
        totalTrades: trades.length,
        closedTrades: closed.length,
        openTrades: trades.length - closed.length,
        winCount: wins.length,
        lossCount: losses.length,
        beCount: bes.length,
        winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
        totalPL,
        totalPips,
        profitFactor,
        avgRR,
        avgWin,
        avgLoss,
        largestWin,
        largestLoss,
        bestPair,
        worstPair,
        bestSession,
    };
}

export function calculatePortfolioGain(portfolio: Portfolio) {
    const gain = portfolio.currentBalance - portfolio.initialBalance;
    const gainPercent = portfolio.initialBalance > 0
        ? (gain / portfolio.initialBalance) * 100
        : 0;
    return { gain, gainPercent };
}

export function calculateAllAccountsStats(portfolios: Portfolio[]) {
    const allTrades = portfolios.flatMap(p => p.trades ?? []);
    const stats = calculateFxStats(allTrades);

    const totalInitial = portfolios.reduce((s, p) => s + p.initialBalance, 0);
    const totalCurrent = portfolios.reduce((s, p) => s + p.currentBalance, 0);
    const totalGain = totalCurrent - totalInitial;
    const totalGainPercent = totalInitial > 0 ? (totalGain / totalInitial) * 100 : 0;

    return {
        ...stats,
        totalInitial,
        totalCurrent,
        totalGain,
        totalGainPercent,
        portfolioCount: portfolios.length,
    };
}

export function calculatePips(
    pair: string,
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    exitPrice: number
): number {
    const isJPY = pair.includes('JPY');
    const isXAU = pair.includes('XAU'); // Gold: 1 pip = $0.10
    const isXAG = pair.includes('XAG');

    const pipSize = isJPY ? 0.01 : isXAU || isXAG ? 0.1 : 0.0001;
    const rawDiff = direction === 'LONG'
        ? exitPrice - entryPrice
        : entryPrice - exitPrice;

    return rawDiff / pipSize;
}

// Rough USD estimate: a precise figure needs the live quote-currency rate.
export function estimatePL(
    pair: string,
    lots: number,
    pips: number
): number {
    // Pip value per standard lot: ~$9.10 on JPY pairs, $10 elsewhere.
    const pipValue = pair.includes('JPY') ? 9.1 : 10;
    return lots * pipValue * pips;
}

export interface EquityPoint {
    date: string;
    balance: number;
    pl: number;
}

export function buildEquityCurve(
    initialBalance: number,
    trades: ForexTrade[],
    cashTransactions: CashTransaction[] = []
): EquityPoint[] {
    const events: Array<{ date: string; amount: number; type: 'trade' | 'cash' }> = [];

    trades
        .filter(t => t.outcome !== undefined && t.result !== undefined)
        .forEach(t => events.push({ date: t.date, amount: t.result!, type: 'trade' }));

    cashTransactions.forEach(tx =>
        events.push({
            date: tx.date,
            amount: tx.type === 'DEPOSIT' ? tx.amount : -tx.amount,
            type: 'cash',
        })
    );

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = initialBalance;
    const curve: EquityPoint[] = [
        { date: '', balance: initialBalance, pl: 0 },
    ];

    events.forEach(ev => {
        balance += ev.amount;
        curve.push({
            date: ev.date,
            balance,
            pl: balance - initialBalance,
        });
    });

    return curve;
}
