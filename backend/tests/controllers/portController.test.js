import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { PortfolioController } from '../../src/controllers/portController.js';
import { PortfolioService } from '../../src/services/portService.js';

function mockRes() {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    res.send = (data) => { res.body = data; return res; };
    return res;
}

const VALID_BODY = {
    name: 'IC Markets Live',
    initialBalance: 10000,
    currency: 'USD',
    accountType: 'LIVE',
};

const ROW = {
    id: 'p1',
    name: 'IC Markets Live',
    initial_balance: 10000,
    current_balance: 10000,
    currency: 'USD',
    account_type: 'LIVE',
};

describe('PortfolioController', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    describe('getPortfolios', () => {
        test('should return 200 with camelCase portfolios on success', async () => {
            mock.method(PortfolioService, 'getAllPortfolios', async () => [ROW]);

            const res = mockRes();
            await PortfolioController.getPortfolios({}, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body[0].initialBalance, 10000);
            assert.strictEqual(res.body[0].accountType, 'LIVE');
            assert.ok(!('initial_balance' in res.body[0]), 'snake_case must not leak to the client');
        });

        test('should nest trades and cash transactions', async () => {
            mock.method(PortfolioService, 'getAllPortfolios', async () => [{
                ...ROW,
                trades: [{ id: 't1', portfolio_id: 'p1', pair: 'EURUSD', entry_price: 1.0845 }],
                cash_transactions: [{ id: 'c1', portfolio_id: 'p1', type: 'DEPOSIT', amount: 500 }],
            }]);

            const res = mockRes();
            await PortfolioController.getPortfolios({}, res);

            assert.strictEqual(res.body[0].trades[0].entryPrice, 1.0845);
            assert.strictEqual(res.body[0].cashTransactions[0].amount, 500);
        });

        test('should return 500 on service error', async () => {
            mock.method(PortfolioService, 'getAllPortfolios', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.getPortfolios({}, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('getPortfolio', () => {
        test('should return 200 with portfolio on success', async () => {
            mock.method(PortfolioService, 'getPortfolio', async () => ROW);

            const res = mockRes();
            await PortfolioController.getPortfolio({ params: { id: 'p1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.name, 'IC Markets Live');
        });

        test('should return 404 when portfolio not found', async () => {
            mock.method(PortfolioService, 'getPortfolio', async () => null);

            const res = mockRes();
            await PortfolioController.getPortfolio({ params: { id: '999' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 500 on service error', async () => {
            mock.method(PortfolioService, 'getPortfolio', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.getPortfolio({ params: { id: 'p1' } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('createPortfolio', () => {
        test('should return 201 on success', async () => {
            mock.method(PortfolioService, 'createPortfolio', async () => [ROW]);

            const res = mockRes();
            await PortfolioController.createPortfolio({ body: VALID_BODY }, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.currentBalance, 10000);
        });

        test('should hand the service a snake_case row', async () => {
            mock.method(PortfolioService, 'createPortfolio', async () => [ROW]);

            const res = mockRes();
            await PortfolioController.createPortfolio({ body: VALID_BODY }, res);

            assert.deepStrictEqual(PortfolioService.createPortfolio.mock.calls[0].arguments, [{
                name: 'IC Markets Live',
                initial_balance: 10000,
                currency: 'USD',
                account_type: 'LIVE',
            }]);
        });

        test('should return 400 when name is missing', async () => {
            const res = mockRes();
            await PortfolioController.createPortfolio({ body: { initialBalance: 10000 } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 400 when initialBalance is not a number', async () => {
            const res = mockRes();
            await PortfolioController.createPortfolio({ body: { ...VALID_BODY, initialBalance: 'ten thousand' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 400 on an unknown account type', async () => {
            const res = mockRes();
            await PortfolioController.createPortfolio({ body: { ...VALID_BODY, accountType: 'HEDGE' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 500 on service error', async () => {
            mock.method(PortfolioService, 'createPortfolio', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.createPortfolio({ body: VALID_BODY }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('updatePortfolio', () => {
        test('should return 200 on success', async () => {
            mock.method(PortfolioService, 'updatePortfolio', async () => [{ ...ROW, name: 'Renamed' }]);

            const res = mockRes();
            await PortfolioController.updatePortfolio({ params: { id: 'p1' }, body: { name: 'Renamed' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.name, 'Renamed');
        });

        test('should only forward the fields the caller supplied', async () => {
            mock.method(PortfolioService, 'updatePortfolio', async () => [ROW]);

            const res = mockRes();
            await PortfolioController.updatePortfolio({ params: { id: 'p1' }, body: { broker: 'FTMO' } }, res);

            assert.deepStrictEqual(PortfolioService.updatePortfolio.mock.calls[0].arguments, ['p1', { broker: 'FTMO' }]);
        });

        // The edit dialog submits its whole form, so initialBalance always
        // arrives; it must be ignored rather than rejected.
        test('should ignore initialBalance instead of rejecting the edit', async () => {
            mock.method(PortfolioService, 'updatePortfolio', async () => [ROW]);

            const res = mockRes();
            await PortfolioController.updatePortfolio({
                params: { id: 'p1' },
                body: { name: 'Renamed', initialBalance: 50000, currency: 'USD', accountType: 'LIVE' },
            }, res);

            assert.strictEqual(res.statusCode, 200);
            const [, updates] = PortfolioService.updatePortfolio.mock.calls[0].arguments;
            assert.ok(!('initial_balance' in updates), 'the funded amount must stay fixed');
            assert.strictEqual(updates.name, 'Renamed');
        });

        test('should return 400 when initialBalance is the only field supplied', async () => {
            const res = mockRes();
            await PortfolioController.updatePortfolio({ params: { id: 'p1' }, body: { initialBalance: 50000 } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 400 when nothing updatable was supplied', async () => {
            const res = mockRes();
            await PortfolioController.updatePortfolio({ params: { id: 'p1' }, body: {} }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 404 when no row matched', async () => {
            mock.method(PortfolioService, 'updatePortfolio', async () => []);

            const res = mockRes();
            await PortfolioController.updatePortfolio({ params: { id: '999' }, body: { name: 'Renamed' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 500 on service error', async () => {
            mock.method(PortfolioService, 'updatePortfolio', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.updatePortfolio({ params: { id: 'p1' }, body: { name: 'Renamed' } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('deletePortfolio', () => {
        test('should return 200 with a JSON body on success', async () => {
            mock.method(PortfolioService, 'deletePortfolio', async () => [{ id: 'p1' }]);

            const res = mockRes();
            await PortfolioController.deletePortfolio({ params: { id: 'p1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            // The API client always calls response.json(), so a body is mandatory.
            assert.ok(res.body.message);
        });

        test('should return 404 when result is null', async () => {
            mock.method(PortfolioService, 'deletePortfolio', async () => null);

            const res = mockRes();
            await PortfolioController.deletePortfolio({ params: { id: '999' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 404 when result is empty array', async () => {
            mock.method(PortfolioService, 'deletePortfolio', async () => []);

            const res = mockRes();
            await PortfolioController.deletePortfolio({ params: { id: '999' } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 400 on service error', async () => {
            mock.method(PortfolioService, 'deletePortfolio', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.deletePortfolio({ params: { id: 'p1' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });
    });
});
