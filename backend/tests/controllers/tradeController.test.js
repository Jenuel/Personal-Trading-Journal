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

describe('TradeController', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    describe('getTrades', () => {
        test('should return 200 with trades on success', async () => {
            const mockTrades = [{ id: 1, symbol: 'AAPL' }, { id: 2, symbol: 'MSFT' }];
            mock.method(TradeService, 'getAllTrades', async () => mockTrades);

            const res = mockRes();
            await TradeController.getTrades({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, mockTrades);
        });

        test('should return 404 when no trades found', async () => {
            mock.method(TradeService, 'getAllTrades', async () => []);

            const res = mockRes();
            await TradeController.getTrades({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 500 on service error', async () => {
            mock.method(TradeService, 'getAllTrades', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.getTrades({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('getTrade', () => {
        test('should return 200 with trade on success', async () => {
            const mockTrade = { id: 1, symbol: 'AAPL' };
            mock.method(TradeService, 'getTrade', async () => mockTrade);

            const res = mockRes();
            await TradeController.getTrade({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, mockTrade);
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
            await TradeController.getTrade({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('createTrade', () => {
        test('should return 201 on success', async () => {
            const mockTrade = { id: 1, portfolio_id: 1, symbol: 'AAPL', quantity: 10, price: 150, type: 'buy', date: '2024-01-01' };
            mock.method(TradeService, 'createTrade', async () => mockTrade);

            const res = mockRes();
            await TradeController.createTrade({
                body: { portId: 1, symbol: 'AAPL', quantity: 10, price: 150, type: 'buy', date: '2024-01-01' }
            }, res);

            assert.strictEqual(res.statusCode, 201);
            assert.deepStrictEqual(res.body, mockTrade);
        });

        test('should map portId to portfolio_id before calling service', async () => {
            mock.method(TradeService, 'createTrade', async (trade) => trade);

            const res = mockRes();
            await TradeController.createTrade({
                body: { portId: 1, symbol: 'AAPL', quantity: 10, price: 150, type: 'buy', date: '2024-01-01' }
            }, res);

            assert.deepStrictEqual(TradeService.createTrade.mock.calls[0].arguments[0], {
                portfolio_id: 1,
                symbol: 'AAPL',
                quantity: 10,
                price: 150,
                type: 'buy',
                date: '2024-01-01'
            });
        });

        test('should return 500 on service error', async () => {
            mock.method(TradeService, 'createTrade', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.createTrade({
                body: { portId: 1, symbol: 'AAPL', quantity: 10, price: 150, type: 'buy', date: '2024-01-01' }
            }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('updateTrade', () => {
        test('should return 200 on success', async () => {
            const mockResult = [{ id: 1, symbol: 'AAPL', quantity: 20 }];
            mock.method(TradeService, 'updateTrade', async () => mockResult);

            const res = mockRes();
            await TradeController.updateTrade({
                params: { id: '1' },
                body: { portId: 1, symbol: 'AAPL', quantity: 20, price: 160, type: 'buy', date: '2024-01-02' }
            }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, mockResult);
        });

        test('should return 404 when trade not found', async () => {
            mock.method(TradeService, 'updateTrade', async () => []);

            const res = mockRes();
            await TradeController.updateTrade({
                params: { id: '999' },
                body: { portId: 1, symbol: 'AAPL', quantity: 20, price: 160, type: 'buy', date: '2024-01-02' }
            }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 400 on service error', async () => {
            mock.method(TradeService, 'updateTrade', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.updateTrade({
                params: { id: '1' },
                body: { portId: 1, symbol: 'AAPL', quantity: 20, price: 160, type: 'buy', date: '2024-01-02' }
            }, res);

            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe('deleteTrade', () => {
        test('should return 200 with deleted trade on success', async () => {
            const mockResult = [{ id: 1, symbol: 'AAPL' }];
            mock.method(TradeService, 'deleteTrade', async () => mockResult);

            const res = mockRes();
            await TradeController.deleteTrade({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, { message: 'Trade deleted successfully', trade: mockResult[0] });
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

        test('should return 400 on service error', async () => {
            mock.method(TradeService, 'deleteTrade', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await TradeController.deleteTrade({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });
    });
});
