import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { TradeController } from '../../src/controllers/tradeController.js';
import { TradeService } from '../../src/services/tradeService.js';

function mockRes() {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    res.send = (data) => { res.body = data; return res; };
    res.sendStatus = (code) => { res.statusCode = code; return res; };
    return res;
}

const VALID_BODY = {
    portfolioId: 'p1',
    pair: 'EURUSD',
    direction: 'LONG',
    lots: 0.5,
    entryPrice: 1.0845,
    exitPrice: 1.0912,
    stopLoss: 1.0810,
    pips: 67,
    result: 335,
    rr: 1.91,
    outcome: 'WIN',
    session: 'LONDON',
    setup: 'Break & Retest',
    date: '2026-09-01',
    notes: 'Clean break above H4 resistance.',
};

const ROW = {
    id: 't1',
    portfolio_id: 'p1',
    pair: 'EURUSD',
    direction: 'LONG',
    lots: 0.5,
    entry_price: 1.0845,
    exit_price: 1.0912,
    pips: 67,
    result: 335,
    outcome: 'WIN',
    session: 'LONDON',
    date: '2026-09-01',
};

describe('TradeController', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    describe('getTrades', () => {
        test('should return 200 with camelCase trades on success', async () => {
            mock.method(TradeService, 'getAllTrades', async () => [ROW]);

            const res = mockRes();
            await TradeController.getTrades({ params: { id: 'p1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body[0].entryPrice, 1.0845);
            assert.strictEqual(res.body[0].portfolioId, 'p1');
            assert.ok(!('entry_price' in res.body[0]), 'snake_case must not leak to the client');
        });

        // An account with no trades yet is a normal state, not a missing resource.
        test('should return 200 with an empty array when the account has no trades', async () => {
            mock.method(TradeService, 'getAllTrades', async () => []);

            const res = mockRes();
            await TradeController.getTrades({ params: { id: 'p1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, []);
        });

        test('should pass the route param through as the portfolio filter', async () => {
            mock.method(TradeService, 'getAllTrades', async () => []);

            await TradeController.getTrades({ params: { id: 'p1' } }, mockRes());

            assert.deepStrictEqual(TradeService.getAllTrades.mock.calls[0].arguments, ['p1']);
        });

        test('should fall back to the portfolioId query param', async () => {
            mock.method(TradeService, 'getAllTrades', async () => []);

            await TradeController.getTrades({ params: {}, query: { portfolioId: 'p2' } }, mockRes());

            assert.deepStrictEqual(TradeService.getAllTrades.mock.calls[0].arguments, ['p2']);
        });

        test('should return 500 on service error', async () => {
            mock.method(TradeService, 'getAllTrades', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.getTrades({ params: { id: 'p1' } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('getTrade', () => {
        test('should return 200 with trade on success', async () => {
            mock.method(TradeService, 'getTrade', async () => ROW);

            const res = mockRes();
            await TradeController.getTrade({ params: { id: 't1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.pair, 'EURUSD');
        });

        test('should return 404 when trade not found', async () => {
            mock.method(TradeService, 'getTrade', async () => null);

            const res = mockRes();
            await TradeController.getTrade({ params: { id: '999' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 500 on service error', async () => {
            mock.method(TradeService, 'getTrade', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.getTrade({ params: { id: 't1' } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('createTrade', () => {
        test('should return 201 on success', async () => {
            mock.method(TradeService, 'createTrade', async () => [ROW]);

            const res = mockRes();
            await TradeController.createTrade({ body: VALID_BODY }, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.result, 335);
        });

        test('should hand the service every FOREX field as a snake_case row', async () => {
            mock.method(TradeService, 'createTrade', async () => [ROW]);

            await TradeController.createTrade({ body: VALID_BODY }, mockRes());

            assert.deepStrictEqual(TradeService.createTrade.mock.calls[0].arguments[0], {
                portfolio_id: 'p1',
                pair: 'EURUSD',
                direction: 'LONG',
                lots: 0.5,
                entry_price: 1.0845,
                exit_price: 1.0912,
                stop_loss: 1.0810,
                pips: 67,
                result: 335,
                rr: 1.91,
                outcome: 'WIN',
                session: 'LONDON',
                setup: 'Break & Retest',
                date: '2026-09-01',
                notes: 'Clean break above H4 resistance.',
            });
        });

        test('should omit optional fields the caller left out', async () => {
            mock.method(TradeService, 'createTrade', async () => [ROW]);

            // An open trade: no exit, no result yet.
            await TradeController.createTrade({
                body: {
                    portfolioId: 'p1', pair: 'GBPJPY', direction: 'SHORT',
                    lots: 0.3, entryPrice: 189.45, date: '2026-09-02',
                }
            }, mockRes());

            const row = TradeService.createTrade.mock.calls[0].arguments[0];
            assert.ok(!('exit_price' in row), 'undefined fields must not be written');
            assert.ok(!('result' in row));
        });

        test('should return 400 when portfolioId is missing', async () => {
            const res = mockRes();
            await TradeController.createTrade({ body: { ...VALID_BODY, portfolioId: undefined } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 400 on an unknown direction', async () => {
            const res = mockRes();
            await TradeController.createTrade({ body: { ...VALID_BODY, direction: 'SIDEWAYS' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 400 when entryPrice is not a number', async () => {
            const res = mockRes();
            await TradeController.createTrade({ body: { ...VALID_BODY, entryPrice: 'cheap' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 400 when date is missing', async () => {
            const res = mockRes();
            await TradeController.createTrade({ body: { ...VALID_BODY, date: undefined } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 500 on service error', async () => {
            mock.method(TradeService, 'createTrade', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.createTrade({ body: VALID_BODY }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('updateTrade', () => {
        test('should return 200 on success', async () => {
            mock.method(TradeService, 'updateTrade', async () => [{ ...ROW, result: 400 }]);

            const res = mockRes();
            await TradeController.updateTrade({ params: { id: 't1' }, body: { result: 400 } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.result, 400);
        });

        // Guards the partial-update contract: the old controller wrote undefined
        // over every column the caller did not send.
        test('should only forward the fields the caller supplied', async () => {
            mock.method(TradeService, 'updateTrade', async () => [ROW]);

            await TradeController.updateTrade({ params: { id: 't1' }, body: { notes: 'Revised' } }, mockRes());

            assert.deepStrictEqual(TradeService.updateTrade.mock.calls[0].arguments, ['t1', { notes: 'Revised' }]);
        });

        test('should return 400 when nothing updatable was supplied', async () => {
            const res = mockRes();
            await TradeController.updateTrade({ params: { id: 't1' }, body: {} }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 404 when trade not found', async () => {
            mock.method(TradeService, 'updateTrade', async () => []);

            const res = mockRes();
            await TradeController.updateTrade({ params: { id: '999' }, body: { result: 400 } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 400 on service error', async () => {
            mock.method(TradeService, 'updateTrade', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.updateTrade({ params: { id: 't1' }, body: { result: 400 } }, res);

            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe('deleteTrade', () => {
        test('should return 200 with the deleted trade on success', async () => {
            mock.method(TradeService, 'deleteTrade', async () => [ROW]);

            const res = mockRes();
            await TradeController.deleteTrade({ params: { id: 't1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.message, 'Trade deleted successfully');
            assert.strictEqual(res.body.trade.pair, 'EURUSD');
        });

        test('should return 404 when trade not found (null result)', async () => {
            mock.method(TradeService, 'deleteTrade', async () => null);

            const res = mockRes();
            await TradeController.deleteTrade({ params: { id: '999' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 404 when trade not found (empty array)', async () => {
            mock.method(TradeService, 'deleteTrade', async () => []);

            const res = mockRes();
            await TradeController.deleteTrade({ params: { id: '999' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 400 with a JSON body on service error', async () => {
            mock.method(TradeService, 'deleteTrade', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.deleteTrade({ params: { id: 't1' } }, res);

            assert.strictEqual(res.statusCode, 400);
            // The API client always calls response.json(), so even errors need a body.
            assert.ok(res.body.message);
        });
    });
});
