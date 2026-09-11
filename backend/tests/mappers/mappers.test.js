import { test, describe } from 'node:test';
import assert from 'node:assert';
import { portfolioToApi, portfolioToRow } from '../../src/mappers/portfolio.js';
import { tradeToApi, tradeToRow } from '../../src/mappers/trade.js';
import { cashTransactionToApi, cashTransactionToRow } from '../../src/mappers/cashTransaction.js';
import { analyticsToApi, analyticsSummariesToApi } from '../../src/mappers/analytics.js';

describe('TradeMapper', () => {
    test('toApi should rename columns and coerce numerics', () => {
        const trade = tradeToApi({
            id: 't1',
            portfolio_id: 'p1',
            pair: 'EURUSD',
            direction: 'LONG',
            lots: '0.5',
            entry_price: '1.0845',
            exit_price: '1.0912',
            stop_loss: '1.0810',
            take_profit: '1.0920',
            pips: '67',
            result: '335',
            rr: '1.91',
            outcome: 'WIN',
            session: 'LONDON',
            setup: 'Break & Retest',
            date: '2026-09-01',
            notes: 'Clean break.',
            created_at: '2026-09-01T00:00:00Z',
        });

        assert.strictEqual(trade.portfolioId, 'p1');
        assert.strictEqual(trade.entryPrice, 1.0845);
        assert.strictEqual(trade.takeProfit, 1.0920);
        assert.strictEqual(trade.rr, 1.91);
        assert.strictEqual(trade.createdAt, '2026-09-01T00:00:00Z');
        assert.ok(!('entry_price' in trade));
    });

    test('toApi should leave a null numeric as null rather than zero', () => {
        const trade = tradeToApi({ id: 't1', exit_price: null, result: null });

        assert.strictEqual(trade.exitPrice, null);
        assert.strictEqual(trade.result, null);
    });

    // The partial-update guarantee: a field the caller omitted is never written.
    test('toRow should omit keys the caller did not supply', () => {
        const row = tradeToRow({ notes: 'Revised' });

        assert.deepStrictEqual(row, { notes: 'Revised' });
    });

    test('toRow should refuse to write read-only columns', () => {
        const row = tradeToRow({ id: 'forged', createdAt: '1999-01-01', notes: 'Revised' });

        assert.deepStrictEqual(row, { notes: 'Revised' });
    });

    test('toApi and toRow should round-trip', () => {
        const original = {
            portfolio_id: 'p1', pair: 'EURUSD', direction: 'LONG',
            lots: 0.5, entry_price: 1.0845, date: '2026-09-01',
        };

        assert.deepStrictEqual(tradeToRow(tradeToApi(original)), original);
    });
});

describe('PortfolioMapper', () => {
    test('toApi should rename columns and coerce balances', () => {
        const portfolio = portfolioToApi({
            id: 'p1',
            name: 'IC Markets Live',
            description: 'Primary',
            initial_balance: '10000',
            current_balance: '11240',
            currency: 'USD',
            broker: 'IC Markets',
            account_type: 'LIVE',
            created_at: '2026-07-01T00:00:00Z',
            updated_at: '2026-09-01T00:00:00Z',
        });

        assert.strictEqual(portfolio.initialBalance, 10000);
        assert.strictEqual(portfolio.currentBalance, 11240);
        assert.strictEqual(portfolio.accountType, 'LIVE');
        assert.ok(!('account_type' in portfolio));
    });

    test('toApi should map the embedded trades and cash transactions', () => {
        const portfolio = portfolioToApi({
            id: 'p1',
            name: 'Main',
            initial_balance: 10000,
            current_balance: 10000,
            trades: [{ id: 't1', portfolio_id: 'p1', entry_price: 1.0845 }],
            cash_transactions: [{ id: 'c1', portfolio_id: 'p1', type: 'DEPOSIT', amount: '500' }],
        });

        assert.strictEqual(portfolio.trades[0].entryPrice, 1.0845);
        assert.strictEqual(portfolio.cashTransactions[0].amount, 500);
    });

    test('toApi should leave the collections off when they were not fetched', () => {
        const portfolio = portfolioToApi({ id: 'p1', name: 'Main' });

        assert.ok(!('trades' in portfolio));
        assert.ok(!('cashTransactions' in portfolio));
    });

    test('toApi should pass null straight through', () => {
        assert.strictEqual(portfolioToApi(null), null);
    });

    test('toRow should omit keys the caller did not supply', () => {
        assert.deepStrictEqual(portfolioToRow({ broker: 'FTMO' }), { broker: 'FTMO' });
    });
});

describe('CashTransactionMapper', () => {
    test('toApi should rename columns and coerce the amount', () => {
        const transaction = cashTransactionToApi({
            id: 'c1', portfolio_id: 'p1', type: 'WITHDRAWAL',
            amount: '750', date: '2026-09-01', created_at: '2026-09-01T00:00:00Z',
        });

        assert.strictEqual(transaction.portfolioId, 'p1');
        assert.strictEqual(transaction.amount, 750);
        assert.strictEqual(transaction.createdAt, '2026-09-01T00:00:00Z');
    });

    test('toRow should omit keys the caller did not supply', () => {
        assert.deepStrictEqual(cashTransactionToRow({ notes: 'Revised' }), { notes: 'Revised' });
    });
});

describe('AnalyticsMapper', () => {
    const ANALYTICS = {
        portfolio_id: 'p1',
        generated_at: '2026-09-11T00:00:01.000Z',
        version: '2026-09-11T00:00:00.000Z',
        currency: 'USD',
        initial_balance: 10000,
        current_balance: 10134,
        summary: {
            total_trades: 3, closed_trades: 2, open_trades: 1,
            win_count: 1, loss_count: 1, be_count: 0,
            win_rate: 50, total_pl: 134, total_pips: 0,
            gross_profit: 335, gross_loss: 201, profit_factor: 1.6667,
            avg_rr: 0.21, avg_win: 335, avg_loss: -201,
            largest_win: 335, largest_loss: -201,
            best_pair: 'EURUSD', worst_pair: null, best_session: 'LONDON',
        },
        equity_curve: [{ date: null, balance: 10000, pl: 0 }],
        by_pair: [{ pair: 'EURUSD', pl: 335, count: 1, wins: 1, win_rate: 100 }],
        by_session: [{ session: 'OTHER', pl: 0, count: 1, wins: 0, win_rate: 0 }],
        monthly: [{ month: '2026-09', pl: 134, count: 2 }],
    };

    // No numericFields here on purpose: the service has already coerced and
    // rounded, so a second Number() pass would only blur who owns the coercion.
    test('toApi should rename the envelope fields', () => {
        const analytics = analyticsToApi(ANALYTICS);

        assert.strictEqual(analytics.portfolioId, 'p1');
        assert.strictEqual(analytics.generatedAt, '2026-09-11T00:00:01.000Z');
        assert.strictEqual(analytics.initialBalance, 10000);
        assert.ok(!('portfolio_id' in analytics), 'snake_case must not leak to the client');
    });

    test('toApi should map the summary and every nested collection', () => {
        const analytics = analyticsToApi(ANALYTICS);

        assert.strictEqual(analytics.summary.totalTrades, 3);
        assert.strictEqual(analytics.summary.grossProfit, 335);
        assert.strictEqual(analytics.byPair[0].winRate, 100);
        assert.strictEqual(analytics.bySession[0].session, 'OTHER');
        assert.strictEqual(analytics.monthly[0].month, '2026-09');
        assert.strictEqual(analytics.equityCurve[0].date, null);
    });

    // createMapper skips undefined but keeps null, which is what carries
    // "no worst pair" and the equity curve's synthetic origin point.
    test('toApi should preserve nulls rather than dropping the key', () => {
        const analytics = analyticsToApi(ANALYTICS);

        assert.ok('worstPair' in analytics.summary, 'a null worstPair must still be reported');
        assert.strictEqual(analytics.summary.worstPair, null);
    });

    test('toApi should serialize an infinite profit factor as a string', () => {
        const analytics = analyticsToApi({
            ...ANALYTICS,
            summary: { ...ANALYTICS.summary, profit_factor: Infinity },
        });

        assert.strictEqual(analytics.summary.profitFactor, 'Infinity');
    });

    test('toApi should omit a collection the payload did not carry', () => {
        const { by_session, ...withoutSessions } = ANALYTICS;
        const analytics = analyticsToApi(withoutSessions);

        assert.ok(!('bySession' in analytics), 'an absent collection must not become undefined');
    });

    test('toApi should pass null straight through', () => {
        assert.strictEqual(analyticsToApi(null), null);
    });

    test('summaries should map to camelCase entries', () => {
        const rows = analyticsSummariesToApi([
            { portfolio_id: 'p1', version: 'v', summary: ANALYTICS.summary },
        ]);

        assert.strictEqual(rows[0].portfolioId, 'p1');
        assert.strictEqual(rows[0].summary.winRate, 50);
    });
});
