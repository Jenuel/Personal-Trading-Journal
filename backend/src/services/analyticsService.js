import { PortfolioRepository as portfolioRepository } from "../repositories/portfolio.js";

// Mixed into the ETag: bump it whenever the arithmetic changes, or cached
// clients will revalidate, match, and keep serving the old numbers.
export const ANALYTICS_SCHEMA_VERSION = 1;

export const MAX_ANALYTICS_CACHE_ENTRIES = 100;

// Every aggregate covers closed trades only: an open position has no realized
// P&L, so counting it would pad win-rate denominators.
function isClosed(trade) {
    return trade?.exit_price !== null
        && trade?.exit_price !== undefined
        && trade?.outcome !== null
        && trade?.outcome !== undefined;
}

// PostgREST serializes NUMERIC as strings; without this the sums concatenate.
function num(value) {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function roundMoney(value) {
    return Math.round(value * 100) / 100;
}

function roundRate(value) {
    return Math.round(value * 10000) / 10000;
}

function mean(values) {
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

function bucket(trades, keyOf) {
    const map = new Map();

    for (const trade of trades) {
        const key = keyOf(trade);
        const entry = map.get(key) ?? { pl: 0, count: 0, wins: 0 };

        entry.pl += num(trade.result);
        entry.count += 1;
        if (trade.outcome === 'WIN') {
            entry.wins += 1;
        }

        map.set(key, entry);
    }

    return map;
}

function breakdown(map, labelKey) {
    return [...map.entries()].map(([key, v]) => ({
        [labelKey]: key,
        pl: roundMoney(v.pl),
        count: v.count,
        wins: v.wins,
        win_rate: v.count > 0 ? roundRate((v.wins / v.count) * 100) : 0,
    }));
}

function computeSummary(trades) {
    const closed = trades.filter(isClosed);
    const wins = closed.filter(t => t.outcome === 'WIN');
    const losses = closed.filter(t => t.outcome === 'LOSS');
    const bes = closed.filter(t => t.outcome === 'BE');

    const grossProfit = wins.reduce((sum, t) => sum + num(t.result), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + num(t.result), 0));

    // Winners and no losers is unbounded, not zero. The mapper serializes it.
    const profitFactor = grossLoss > 0
        ? grossProfit / grossLoss
        : grossProfit > 0 ? Infinity : 0;

    const pairsByPL = [...bucket(closed, t => t.pair).entries()]
        .sort((a, b) => b[1].pl - a[1].pl);

    // Unlabelled trades cannot rank, but by_session still shows them as OTHER.
    const sessioned = closed.filter(t => t.session !== null && t.session !== undefined);
    const sessionsByWinRate = [...bucket(sessioned, t => t.session).entries()]
        .map(([session, v]) => ({ session, winRate: v.count > 0 ? v.wins / v.count : 0 }))
        .sort((a, b) => b.winRate - a.winRate);

    return {
        total_trades: trades.length,
        closed_trades: closed.length,
        open_trades: trades.length - closed.length,
        win_count: wins.length,
        loss_count: losses.length,
        be_count: bes.length,
        win_rate: closed.length > 0 ? roundRate((wins.length / closed.length) * 100) : 0,
        total_pl: roundMoney(closed.reduce((sum, t) => sum + num(t.result), 0)),
        total_pips: roundRate(closed.reduce((sum, t) => sum + num(t.pips), 0)),
        gross_profit: roundMoney(grossProfit),
        gross_loss: roundMoney(grossLoss),
        profit_factor: Number.isFinite(profitFactor) ? roundRate(profitFactor) : profitFactor,
        avg_rr: roundRate(mean(closed.map(t => num(t.rr)))),
        avg_win: roundMoney(mean(wins.map(t => num(t.result)))),
        avg_loss: roundMoney(mean(losses.map(t => num(t.result)))),
        largest_win: wins.length > 0 ? roundMoney(Math.max(...wins.map(t => num(t.result)))) : 0,
        largest_loss: losses.length > 0 ? roundMoney(Math.min(...losses.map(t => num(t.result)))) : 0,
        best_pair: pairsByPL.length > 0 ? pairsByPL[0][0] : null,
        // With a single pair, "worst" would just repeat "best".
        worst_pair: pairsByPL.length > 1 ? pairsByPL[pairsByPL.length - 1][0] : null,
        best_session: sessionsByWinRate.length > 0 ? sessionsByWinRate[0].session : null,
    };
}

// Mirrors recalculateBalance, so the last point equals current_balance.
function computeEquityCurve(initialBalance, trades, cashTransactions) {
    const events = [];

    for (const trade of trades.filter(isClosed)) {
        events.push({ date: trade.date, amount: num(trade.result) });
    }

    for (const transaction of cashTransactions) {
        events.push({
            date: transaction.date,
            amount: transaction.type === 'DEPOSIT'
                ? num(transaction.amount)
                : -num(transaction.amount),
        });
    }

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = initialBalance;
    const curve = [{ date: null, balance: roundMoney(balance), pl: 0 }];

    for (const event of events) {
        balance += event.amount;
        curve.push({
            date: event.date,
            balance: roundMoney(balance),
            pl: roundMoney(balance - initialBalance),
        });
    }

    return curve;
}

// Keyed by portfolio id and updated_at, which recalculateBalance stamps after
// every trade and cash write. A write changes the key, so a stale entry is
// simply never read again — no purge path, and safe across processes.
const cache = new Map();

function memoize(key, compute) {
    if (cache.has(key)) {
        // Re-insert so Map iteration order stays LRU for the eviction below.
        const hit = cache.get(key);
        cache.delete(key);
        cache.set(key, hit);
        return hit;
    }

    const value = Object.freeze(compute());
    cache.set(key, value);

    if (cache.size > MAX_ANALYTICS_CACHE_ENTRIES) {
        cache.delete(cache.keys().next().value);
    }

    return value;
}

export function __resetAnalyticsCache() {
    cache.clear();
}

export const AnalyticsService = {
    // Pure, so both routes and every test share one definition of each figure.
    computeAnalytics: (portfolio) => {
        const trades = portfolio.trades ?? [];
        const cashTransactions = portfolio.cash_transactions ?? [];
        const closed = trades.filter(isClosed);
        const initialBalance = num(portfolio.initial_balance);

        return {
            portfolio_id: portfolio.id,
            // Inside the memo, not per request: one ETag, one body.
            generated_at: new Date().toISOString(),
            version: portfolio.updated_at ?? null,
            currency: portfolio.currency,
            initial_balance: roundMoney(initialBalance),
            current_balance: roundMoney(num(portfolio.current_balance)),
            summary: computeSummary(trades),
            equity_curve: computeEquityCurve(initialBalance, trades, cashTransactions),
            by_pair: breakdown(bucket(closed, t => t.pair), 'pair')
                .sort((a, b) => b.pl - a.pl),
            by_session: breakdown(bucket(closed, t => t.session ?? 'OTHER'), 'session')
                .sort((a, b) => b.win_rate - a.win_rate),
            monthly: breakdown(bucket(closed, t => String(t.date).slice(0, 7)), 'month')
                .map(({ month, pl, count }) => ({ month, pl, count }))
                .sort((a, b) => a.month.localeCompare(b.month)),
        };
    },

    // The cheap read behind revalidation: no trades fetched. Null means the
    // account is missing, as distinct from never stamped.
    getVersion: async (portfolioId) => {
        const portfolio = await portfolioRepository.getPortfolioVersion(portfolioId);

        return portfolio ? (portfolio.updated_at ?? '') : null;
    },

    getAnalytics: async (portfolioId) => {
        const portfolio = await portfolioRepository.getPortfolioById(portfolioId);

        if (!portfolio) {
            return null;
        }

        const version = portfolio.updated_at;
        const analytics = memoize(
            `${portfolioId}:${version}`,
            () => AnalyticsService.computeAnalytics(portfolio)
        );

        return { version, analytics };
    },

    listSummaries: async (portfolioIds) => {
        const portfolios = await portfolioRepository.getAllPortfolios();

        if (!portfolios) {
            throw new Error('Failed to fetch portfolios');
        }

        const wanted = portfolioIds?.length
            ? portfolios.filter(p => portfolioIds.includes(p.id))
            : portfolios;

        return wanted.map((portfolio) => {
            const analytics = memoize(
                `${portfolio.id}:${portfolio.updated_at}`,
                () => AnalyticsService.computeAnalytics(portfolio)
            );

            return {
                portfolio_id: portfolio.id,
                version: portfolio.updated_at,
                summary: analytics.summary,
            };
        });
    },
}
