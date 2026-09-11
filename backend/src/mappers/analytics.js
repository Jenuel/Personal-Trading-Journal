import { createMapper } from './mapping.js';

const ENVELOPE_FIELDS = {
    portfolioId: 'portfolio_id',
    generatedAt: 'generated_at',
    version: 'version',
    currency: 'currency',
    initialBalance: 'initial_balance',
    currentBalance: 'current_balance',
};

const SUMMARY_FIELDS = {
    totalTrades: 'total_trades',
    closedTrades: 'closed_trades',
    openTrades: 'open_trades',
    winCount: 'win_count',
    lossCount: 'loss_count',
    beCount: 'be_count',
    winRate: 'win_rate',
    totalPL: 'total_pl',
    totalPips: 'total_pips',
    grossProfit: 'gross_profit',
    grossLoss: 'gross_loss',
    profitFactor: 'profit_factor',
    avgRR: 'avg_rr',
    avgWin: 'avg_win',
    avgLoss: 'avg_loss',
    largestWin: 'largest_win',
    largestLoss: 'largest_loss',
    bestPair: 'best_pair',
    worstPair: 'worst_pair',
    bestSession: 'best_session',
};

// No numericFields: the service has already coerced and rounded.
const EnvelopeMapper = createMapper({ fields: ENVELOPE_FIELDS });
const SummaryMapper = createMapper({ fields: SUMMARY_FIELDS });

// JSON.stringify turns Infinity into null, which would read as "not
// computable". Send the string instead; the client renders it as ∞.
function profitFactorToApi(value) {
    return Number.isFinite(value) ? value : 'Infinity';
}

export function analyticsSummaryToApi(summary) {
    if (!summary) {
        return summary;
    }

    const result = SummaryMapper.toApi(summary);
    result.profitFactor = profitFactorToApi(summary.profit_factor);

    return result;
}

// Hand-written like portfolioToApi: the payload carries nested collections.
export function analyticsToApi(analytics) {
    if (!analytics) {
        return analytics;
    }

    const result = EnvelopeMapper.toApi(analytics);

    if (analytics.summary !== undefined) {
        result.summary = analyticsSummaryToApi(analytics.summary);
    }

    if (analytics.equity_curve !== undefined) {
        result.equityCurve = analytics.equity_curve.map(point => ({
            date: point.date,
            balance: point.balance,
            pl: point.pl,
        }));
    }

    if (analytics.by_pair !== undefined) {
        result.byPair = analytics.by_pair.map(entry => ({
            pair: entry.pair,
            pl: entry.pl,
            count: entry.count,
            wins: entry.wins,
            winRate: entry.win_rate,
        }));
    }

    if (analytics.by_session !== undefined) {
        result.bySession = analytics.by_session.map(entry => ({
            session: entry.session,
            pl: entry.pl,
            count: entry.count,
            wins: entry.wins,
            winRate: entry.win_rate,
        }));
    }

    if (analytics.monthly !== undefined) {
        result.monthly = analytics.monthly.map(entry => ({
            month: entry.month,
            pl: entry.pl,
            count: entry.count,
        }));
    }

    return result;
}

export const analyticsSummariesToApi = (rows) => (rows ?? []).map(row => ({
    portfolioId: row.portfolio_id,
    version: row.version,
    summary: analyticsSummaryToApi(row.summary),
}));

// No toRow: analytics is derived and never written by a client.
