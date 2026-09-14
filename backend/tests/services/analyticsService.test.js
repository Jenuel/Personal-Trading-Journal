import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import {
    AnalyticsService,
    MAX_ANALYTICS_CACHE_ENTRIES,
    __resetAnalyticsCache,
} from '../../src/services/analyticsService.js';
import { PortfolioRepository } from '../../src/repositories/portfolio.js';

function closedTrade(overrides = {}) {
    return {
        pair: 'EURUSD',
        direction: 'LONG',
        entry_price: 1.0845,
        exit_price: 1.0912,
        outcome: 'WIN',
        result: 100,
        pips: 10,
        rr: 1,
        session: 'LONDON',
        date: '2026-09-01T00:00:00.000Z',
        ...overrides,
    };
}

function portfolio(overrides = {}) {
    return {
        id: 'p1',
        currency: 'USD',
        initial_balance: 10000,
        current_balance: 10000,
        updated_at: '2026-09-11T00:00:00.000Z',
        trades: [],
        cash_transactions: [],
        ...overrides,
    };
}

function keysAreSnakeCase(value, path = 'payload') {
    if (Array.isArray(value)) {
        return value.every((v, i) => keysAreSnakeCase(v, `${path}[${i}]`));
    }
    if (value === null || typeof value !== 'object') {
        return true;
    }
    return Object.entries(value).every(([key, v]) => {
        assert.ok(/^[a-z][a-z0-9_]*$/.test(key), `${path}.${key} is not snake_case`);
        return keysAreSnakeCase(v, `${path}.${key}`);
    });
}

describe('AnalyticsService', () => {
    afterEach(() => {
        mock.restoreAll();
        // Module-level state would hand the memo tests below phantom hits.
        __resetAnalyticsCache();
    });

    describe('computeAnalytics', () => {
        test('should count a trade as closed only when it has both an exit price and an outcome', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade(),
                    closedTrade({ exit_price: 1.09, outcome: null }),
                    closedTrade({ exit_price: null, outcome: 'WIN' }),
                    closedTrade({ exit_price: null, outcome: null }),
                ],
            }));

            assert.strictEqual(summary.total_trades, 4);
            assert.strictEqual(summary.closed_trades, 1);
            assert.strictEqual(summary.open_trades, 3);
        });

        // The reason this change exists: open trades used to pad the denominator.
        test('should compute the win rate over closed trades only', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade({ outcome: 'WIN', result: 100 }),
                    closedTrade({ outcome: 'WIN', result: 100 }),
                    closedTrade({ outcome: 'LOSS', result: -50 }),
                    closedTrade({ exit_price: null, outcome: null, result: null }),
                    closedTrade({ exit_price: null, outcome: null, result: null }),
                ],
            }));

            assert.strictEqual(summary.closed_trades, 3);
            assert.strictEqual(summary.win_rate, 66.6667);
        });

        test('should divide gross profit by gross loss for the profit factor', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade({ outcome: 'WIN', result: 300 }),
                    closedTrade({ outcome: 'LOSS', result: -100 }),
                ],
            }));

            assert.strictEqual(summary.gross_profit, 300);
            assert.strictEqual(summary.gross_loss, 100);
            assert.strictEqual(summary.profit_factor, 3);
        });

        test('should report an infinite profit factor when there are no losses', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [closedTrade({ outcome: 'WIN', result: 300 })],
            }));

            assert.strictEqual(summary.profit_factor, Infinity);
        });

        test('should report a zero profit factor when there are no closed trades', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [closedTrade({ exit_price: null, outcome: null })],
            }));

            assert.strictEqual(summary.profit_factor, 0);
        });

        // PostgREST serializes NUMERIC as strings; uncoerced, these concatenate.
        test('should coerce string numerics before aggregating', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade({ result: '335.00', pips: '67', rr: '1.91' }),
                    closedTrade({ outcome: 'LOSS', result: '-201', pips: '-67', rr: '-1.49' }),
                ],
            }));

            assert.strictEqual(summary.total_pl, 134);
            assert.strictEqual(summary.total_pips, 0);
            assert.strictEqual(summary.avg_rr, 0.21);
        });

        test('should rank the best and worst pair by total P&L', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade({ pair: 'EURUSD', result: 300 }),
                    closedTrade({ pair: 'XAUUSD', result: 100 }),
                    closedTrade({ pair: 'GBPJPY', outcome: 'LOSS', result: -200 }),
                ],
            }));

            assert.strictEqual(summary.best_pair, 'EURUSD');
            assert.strictEqual(summary.worst_pair, 'GBPJPY');
        });

        // One pair cannot be both the best and the worst.
        test('should report no worst pair when only one pair was traded', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [closedTrade({ pair: 'EURUSD' }), closedTrade({ pair: 'EURUSD' })],
            }));

            assert.strictEqual(summary.best_pair, 'EURUSD');
            assert.strictEqual(summary.worst_pair, null);
        });

        test('should bucket unlabelled sessions as OTHER but never rank them best', () => {
            const { summary, by_session } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade({ session: null, outcome: 'WIN', result: 500 }),
                    closedTrade({ session: 'TOKYO', outcome: 'LOSS', result: -100 }),
                ],
            }));

            assert.strictEqual(summary.best_session, 'TOKYO');
            assert.ok(by_session.some(s => s.session === 'OTHER'), 'expected an OTHER bucket');
        });

        test('should sort pairs by P&L descending and sessions by win rate descending', () => {
            const { by_pair, by_session } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade({ pair: 'GBPJPY', session: 'TOKYO', outcome: 'LOSS', result: -200 }),
                    closedTrade({ pair: 'EURUSD', session: 'LONDON', outcome: 'WIN', result: 300 }),
                ],
            }));

            assert.deepStrictEqual(by_pair.map(p => p.pair), ['EURUSD', 'GBPJPY']);
            assert.deepStrictEqual(by_session.map(s => s.session), ['LONDON', 'TOKYO']);
        });

        // Trimming to the last 12 is the page's job, not the API's.
        test('should return every month ascending without truncating', () => {
            const trades = Array.from({ length: 15 }, (_, i) => closedTrade({
                date: `2025-${String(i + 1).padStart(2, '0')}-01T00:00:00.000Z`,
            }));

            const { monthly } = AnalyticsService.computeAnalytics(portfolio({ trades }));

            assert.strictEqual(monthly.length, 15);
            assert.strictEqual(monthly[0].month, '2025-01');
            assert.deepStrictEqual(monthly.map(m => m.month), [...monthly.map(m => m.month)].sort());
        });

        test('should seed the equity curve with the funded amount and interleave cash with trades', () => {
            const { equity_curve } = AnalyticsService.computeAnalytics(portfolio({
                initial_balance: 10000,
                trades: [closedTrade({ result: 335, date: '2026-09-06T00:00:00.000Z' })],
                cash_transactions: [
                    { type: 'DEPOSIT', amount: 2000, date: '2026-09-04T00:00:00.000Z' },
                    { type: 'WITHDRAWAL', amount: 750, date: '2026-09-08T00:00:00.000Z' },
                ],
            }));

            assert.deepStrictEqual(equity_curve, [
                { date: null, balance: 10000, pl: 0 },
                { date: '2026-09-04T00:00:00.000Z', balance: 12000, pl: 2000 },
                { date: '2026-09-06T00:00:00.000Z', balance: 12335, pl: 2335 },
                { date: '2026-09-08T00:00:00.000Z', balance: 11585, pl: 1585 },
            ]);
        });

        // Diverge here and the page and the account balance disagree.
        test('should end the equity curve where recalculateBalance would', () => {
            const { equity_curve } = AnalyticsService.computeAnalytics(portfolio({
                initial_balance: 10000,
                trades: [
                    closedTrade({ result: 335 }),
                    closedTrade({ outcome: 'LOSS', result: -201 }),
                    closedTrade({ exit_price: null, outcome: null, result: null }),
                ],
                cash_transactions: [{ type: 'DEPOSIT', amount: 500, date: '2026-09-02T00:00:00.000Z' }],
            }));

            assert.strictEqual(equity_curve[equity_curve.length - 1].balance, 10634);
        });

        // Math.max of an empty list is -Infinity; this is the guard.
        test('should handle an account with no trades at all', () => {
            const result = AnalyticsService.computeAnalytics(portfolio());

            assert.strictEqual(result.summary.largest_win, 0);
            assert.strictEqual(result.summary.largest_loss, 0);
            assert.strictEqual(result.summary.win_rate, 0);
            assert.strictEqual(result.summary.best_pair, null);
            assert.strictEqual(result.summary.worst_pair, null);
            assert.strictEqual(result.summary.best_session, null);
            assert.strictEqual(result.equity_curve.length, 1);
        });

        test('should keep losses negative', () => {
            const { summary } = AnalyticsService.computeAnalytics(portfolio({
                trades: [
                    closedTrade({ outcome: 'LOSS', result: -201 }),
                    closedTrade({ outcome: 'LOSS', result: -99 }),
                ],
            }));

            assert.strictEqual(summary.avg_loss, -150);
            assert.strictEqual(summary.largest_loss, -201);
        });

        // Keeps the camelCase boundary inside mappers/.
        test('should never emit a camelCase key', () => {
            const result = AnalyticsService.computeAnalytics(portfolio({
                trades: [closedTrade()],
                cash_transactions: [{ type: 'DEPOSIT', amount: 100, date: '2026-09-02T00:00:00.000Z' }],
            }));

            keysAreSnakeCase(result);
        });
    });

    describe('getVersion', () => {
        test('should read the version without fetching trades', async () => {
            mock.method(PortfolioRepository, 'getPortfolioVersion', async () => ({
                id: 'p1',
                updated_at: '2026-09-11T00:00:00.000Z',
            }));
            mock.method(PortfolioRepository, 'getPortfolioById', async () => portfolio());

            const version = await AnalyticsService.getVersion('p1');

            assert.strictEqual(version, '2026-09-11T00:00:00.000Z');
            assert.strictEqual(PortfolioRepository.getPortfolioById.mock.callCount(), 0);
        });

        test('should return null for a portfolio that does not exist', async () => {
            mock.method(PortfolioRepository, 'getPortfolioVersion', async () => null);

            assert.strictEqual(await AnalyticsService.getVersion('nope'), null);
        });
    });

    describe('getAnalytics', () => {
        test('should return null for a portfolio that does not exist', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => null);

            assert.strictEqual(await AnalyticsService.getAnalytics('nope'), null);
        });

        // Object identity is the only clean proof the computation was skipped.
        test('should reuse the memoized payload while updated_at is unchanged', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => portfolio());

            const first = await AnalyticsService.getAnalytics('p1');
            const second = await AnalyticsService.getAnalytics('p1');

            assert.strictEqual(first.analytics, second.analytics);
        });

        test('should recompute once updated_at moves', async () => {
            let version = '2026-09-11T00:00:00.000Z';
            mock.method(PortfolioRepository, 'getPortfolioById', async () => portfolio({ updated_at: version }));

            const first = await AnalyticsService.getAnalytics('p1');
            version = '2026-09-11T00:00:01.000Z';
            const second = await AnalyticsService.getAnalytics('p1');

            assert.notStrictEqual(first.analytics, second.analytics);
            assert.strictEqual(second.version, '2026-09-11T00:00:01.000Z');
        });

        test('should key the memo by portfolio as well as version', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async (id) => portfolio({ id }));

            const a = await AnalyticsService.getAnalytics('p1');
            const b = await AnalyticsService.getAnalytics('p2');

            assert.notStrictEqual(a.analytics, b.analytics);
            assert.strictEqual(b.analytics.portfolio_id, 'p2');
        });

        test('should evict the oldest entry once the cache is full', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async (id) => portfolio({ id }));

            const first = await AnalyticsService.getAnalytics('acct-0');
            for (let i = 1; i <= MAX_ANALYTICS_CACHE_ENTRIES; i++) {
                await AnalyticsService.getAnalytics(`acct-${i}`);
            }
            const refetched = await AnalyticsService.getAnalytics('acct-0');

            assert.notStrictEqual(first.analytics, refetched.analytics);
        });

        test('should freeze the memoized payload', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => portfolio());

            const { analytics } = await AnalyticsService.getAnalytics('p1');

            assert.ok(Object.isFrozen(analytics), 'a shared cache entry must not be mutable');
        });
    });

    describe('listSummaries', () => {
        test('should return one summary per account', async () => {
            mock.method(PortfolioRepository, 'getAllPortfolios', async () => [
                portfolio({ id: 'p1', trades: [closedTrade()] }),
                portfolio({ id: 'p2', trades: [] }),
            ]);

            const summaries = await AnalyticsService.listSummaries();

            assert.strictEqual(summaries.length, 2);
            assert.deepStrictEqual(summaries.map(s => s.portfolio_id), ['p1', 'p2']);
            assert.strictEqual(summaries[0].summary.closed_trades, 1);
        });

        test('should filter to the requested accounts', async () => {
            mock.method(PortfolioRepository, 'getAllPortfolios', async () => [
                portfolio({ id: 'p1' }),
                portfolio({ id: 'p2' }),
            ]);

            const summaries = await AnalyticsService.listSummaries(['p2']);

            assert.deepStrictEqual(summaries.map(s => s.portfolio_id), ['p2']);
        });

        test('should throw when the portfolios cannot be fetched', async () => {
            mock.method(PortfolioRepository, 'getAllPortfolios', async () => null);

            await assert.rejects(
                async () => await AnalyticsService.listSummaries(),
                { message: 'Failed to fetch portfolios' }
            );
        });
    });
});
