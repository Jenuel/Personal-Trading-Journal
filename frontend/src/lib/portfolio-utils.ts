import { Portfolio, AccountCurrency, ProfitFactor } from '@/types/types';

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

/** The API sends 'Infinity' as a string; JSON cannot represent the number. */
export function formatProfitFactor(pf: ProfitFactor): string {
    return pf === 'Infinity' ? '∞' : pf.toFixed(2);
}

/** An infinite profit factor clears every threshold. */
export function profitFactorAtLeast(pf: ProfitFactor, threshold: number): boolean {
    return pf === 'Infinity' || pf >= threshold;
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

export function calculatePortfolioGain(portfolio: Portfolio) {
    const gain = portfolio.currentBalance - portfolio.initialBalance;
    const gainPercent = portfolio.initialBalance > 0
        ? (gain / portfolio.initialBalance) * 100
        : 0;
    return { gain, gainPercent };
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

// Input estimators, not analytics: the trade dialog runs these against a
// half-filled form for a trade the server has never seen. Not leftovers of the
// calculateFxStats migration.
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
