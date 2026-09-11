import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { AnalyticsController } from '../../src/controllers/analyticsController.js';
import { AnalyticsService } from '../../src/services/analyticsService.js';

function mockRes() {
    const res = { headers: {} };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    res.send = (data) => { res.body = data; return res; };
    res.set = (key, value) => { res.headers[key.toLowerCase()] = value; return res; };
    res.get = (key) => res.headers[key.toLowerCase()];
    res.end = () => { res.ended = true; return res; };
    return res;
}

const VERSION = '2026-09-11T00:00:00.000Z';

const ANALYTICS = {
    portfolio_id: 'p1',
    generated_at: '2026-09-11T00:00:01.000Z',
    version: VERSION,
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
        best_pair: 'EURUSD', worst_pair: 'GBPJPY', best_session: 'LONDON',
    },
    equity_curve: [{ date: null, balance: 10000, pl: 0 }],
    by_pair: [{ pair: 'EURUSD', pl: 335, count: 1, wins: 1, win_rate: 100 }],
    by_session: [{ session: 'LONDON', pl: 335, count: 1, wins: 1, win_rate: 100 }],
    monthly: [{ month: '2026-09', pl: 134, count: 2 }],
};

function stubService({ version = VERSION, analytics = ANALYTICS } = {}) {
    mock.method(AnalyticsService, 'getVersion', async () => version);
    mock.method(AnalyticsService, 'getAnalytics', async () => (
        analytics === null ? null : { version, analytics }
    ));
}

async function captureEtag() {
    const res = mockRes();
    await AnalyticsController.getAnalytics({ params: { id: 'p1' }, headers: {} }, res);
    return res.get('ETag');
}

function assertNoSnakeCase(value, path = 'body') {
    if (Array.isArray(value)) {
        value.forEach((v, i) => assertNoSnakeCase(v, `${path}[${i}]`));
        return;
    }
    if (value === null || typeof value !== 'object') {
        return;
    }
    for (const [key, v] of Object.entries(value)) {
        assert.ok(!key.includes('_'), `${path}.${key} leaked snake_case to the client`);
        assertNoSnakeCase(v, `${path}.${key}`);
    }
}

describe('AnalyticsController', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    describe('getAnalytics', () => {
        test('should return 200 with camelCase analytics', async () => {
            stubService();

            const res = mockRes();
            await AnalyticsController.getAnalytics({ params: { id: 'p1' }, headers: {} }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.portfolioId, 'p1');
            assert.strictEqual(res.body.summary.winRate, 50);
            assert.strictEqual(res.body.byPair[0].winRate, 100);
            assertNoSnakeCase(res.body);
        });

        test('should set a strong ETag and a revalidating Cache-Control', async () => {
            stubService();

            const res = mockRes();
            await AnalyticsController.getAnalytics({ params: { id: 'p1' }, headers: {} }, res);

            const etag = res.get('ETag');
            assert.ok(etag.startsWith('"') && etag.endsWith('"'), 'expected a quoted ETag');
            assert.ok(!etag.startsWith('W/'), 'the validator must be strong');
            assert.strictEqual(res.get('Cache-Control'), 'private, no-cache');
            assert.strictEqual(res.get('Vary'), 'Authorization');
        });

        test('should produce the same ETag for an unchanged version', async () => {
            stubService();

            assert.strictEqual(await captureEtag(), await captureEtag());
        });

        test('should produce a different ETag once the version moves', async () => {
            stubService();
            const before = await captureEtag();

            mock.restoreAll();
            stubService({ version: '2026-09-11T00:00:05.000Z' });

            assert.notStrictEqual(before, await captureEtag());
        });

        // The assertion that actually proves the cache works: no recomputation.
        test('should return 304 for a matching If-None-Match without computing', async () => {
            stubService();
            const etag = await captureEtag();

            mock.restoreAll();
            stubService();

            const res = mockRes();
            await AnalyticsController.getAnalytics(
                { params: { id: 'p1' }, headers: { 'if-none-match': etag } },
                res
            );

            assert.strictEqual(res.statusCode, 304);
            assert.strictEqual(res.ended, true);
            assert.strictEqual(res.body, undefined);
            assert.strictEqual(res.get('ETag'), etag);
            assert.strictEqual(AnalyticsService.getAnalytics.mock.callCount(), 0);
        });

        // If-None-Match mandates weak comparison.
        test('should return 304 for a weak form of the same validator', async () => {
            stubService();
            const etag = await captureEtag();

            const res = mockRes();
            await AnalyticsController.getAnalytics(
                { params: { id: 'p1' }, headers: { 'if-none-match': `W/${etag}` } },
                res
            );

            assert.strictEqual(res.statusCode, 304);
        });

        test('should return 304 for a list of validators containing ours', async () => {
            stubService();
            const etag = await captureEtag();

            const res = mockRes();
            await AnalyticsController.getAnalytics(
                { params: { id: 'p1' }, headers: { 'if-none-match': `"other", ${etag}` } },
                res
            );

            assert.strictEqual(res.statusCode, 304);
        });

        test('should return 304 for a wildcard If-None-Match', async () => {
            stubService();

            const res = mockRes();
            await AnalyticsController.getAnalytics(
                { params: { id: 'p1' }, headers: { 'if-none-match': '*' } },
                res
            );

            assert.strictEqual(res.statusCode, 304);
        });

        test('should return 200 for a stale If-None-Match', async () => {
            stubService();

            const res = mockRes();
            await AnalyticsController.getAnalytics(
                { params: { id: 'p1' }, headers: { 'if-none-match': '"v1.stale"' } },
                res
            );

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(AnalyticsService.getAnalytics.mock.callCount(), 1);
        });

        test('should return 404 when the account does not exist', async () => {
            mock.method(AnalyticsService, 'getVersion', async () => null);
            mock.method(AnalyticsService, 'getAnalytics', async () => null);

            const res = mockRes();
            await AnalyticsController.getAnalytics({ params: { id: 'nope' }, headers: {} }, res);

            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(AnalyticsService.getAnalytics.mock.callCount(), 0);
        });

        test('should return 404 when the account is deleted between the two reads', async () => {
            mock.method(AnalyticsService, 'getVersion', async () => VERSION);
            mock.method(AnalyticsService, 'getAnalytics', async () => null);

            const res = mockRes();
            await AnalyticsController.getAnalytics({ params: { id: 'p1' }, headers: {} }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        // The older validator must not be left describing a newer body.
        test('should serve the newer validator when a write lands mid-request', async () => {
            mock.method(AnalyticsService, 'getVersion', async () => VERSION);
            mock.method(AnalyticsService, 'getAnalytics', async () => ({
                version: '2026-09-11T00:00:09.000Z',
                analytics: ANALYTICS,
            }));

            const res = mockRes();
            await AnalyticsController.getAnalytics({ params: { id: 'p1' }, headers: {} }, res);

            mock.restoreAll();
            stubService({ version: '2026-09-11T00:00:09.000Z' });

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.get('ETag'), await captureEtag());
        });

        test('should return 500 when the service throws', async () => {
            mock.method(AnalyticsService, 'getVersion', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await AnalyticsController.getAnalytics({ params: { id: 'p1' }, headers: {} }, res);

            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.error, 'DB error');
        });

        // JSON.stringify would silently turn Infinity into null.
        test('should serialize an infinite profit factor as a string', async () => {
            stubService({
                analytics: { ...ANALYTICS, summary: { ...ANALYTICS.summary, profit_factor: Infinity } },
            });

            const res = mockRes();
            await AnalyticsController.getAnalytics({ params: { id: 'p1' }, headers: {} }, res);

            assert.strictEqual(res.body.summary.profitFactor, 'Infinity');
            assert.strictEqual(JSON.parse(JSON.stringify(res.body)).summary.profitFactor, 'Infinity');
        });
    });

    describe('getSummaries', () => {
        const ROWS = [{ portfolio_id: 'p1', version: VERSION, summary: ANALYTICS.summary }];

        test('should return 200 with one camelCase summary per account', async () => {
            mock.method(AnalyticsService, 'listSummaries', async () => ROWS);

            const res = mockRes();
            await AnalyticsController.getSummaries({ query: {}, headers: {} }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body[0].portfolioId, 'p1');
            assert.strictEqual(res.body[0].summary.totalTrades, 3);
            assertNoSnakeCase(res.body);
        });

        test('should forward a parsed portfolioIds filter', async () => {
            mock.method(AnalyticsService, 'listSummaries', async () => ROWS);

            await AnalyticsController.getSummaries(
                { query: { portfolioIds: 'p1, p2 ,' }, headers: {} },
                mockRes()
            );

            assert.deepStrictEqual(
                AnalyticsService.listSummaries.mock.calls[0].arguments,
                [['p1', 'p2']]
            );
        });

        test('should forward undefined when no filter is supplied', async () => {
            mock.method(AnalyticsService, 'listSummaries', async () => ROWS);

            await AnalyticsController.getSummaries({ query: {}, headers: {} }, mockRes());

            assert.deepStrictEqual(AnalyticsService.listSummaries.mock.calls[0].arguments, [undefined]);
        });

        test('should return 304 for a matching If-None-Match', async () => {
            mock.method(AnalyticsService, 'listSummaries', async () => ROWS);

            const first = mockRes();
            await AnalyticsController.getSummaries({ query: {}, headers: {} }, first);

            const res = mockRes();
            await AnalyticsController.getSummaries(
                { query: {}, headers: { 'if-none-match': first.get('ETag') } },
                res
            );

            assert.strictEqual(res.statusCode, 304);
            assert.strictEqual(res.body, undefined);
        });

        test('should change the ETag when any account version moves', async () => {
            mock.method(AnalyticsService, 'listSummaries', async () => ROWS);
            const before = mockRes();
            await AnalyticsController.getSummaries({ query: {}, headers: {} }, before);

            mock.restoreAll();
            mock.method(AnalyticsService, 'listSummaries', async () => [
                { ...ROWS[0], version: '2026-09-11T00:00:07.000Z' },
            ]);
            const after = mockRes();
            await AnalyticsController.getSummaries({ query: {}, headers: {} }, after);

            assert.notStrictEqual(before.get('ETag'), after.get('ETag'));
        });

        test('should return 500 when the service throws', async () => {
            mock.method(AnalyticsService, 'listSummaries', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await AnalyticsController.getSummaries({ query: {}, headers: {} }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });
});
