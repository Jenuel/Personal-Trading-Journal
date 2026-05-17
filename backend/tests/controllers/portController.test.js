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

describe('PortfolioController', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    describe('getPortfolios', () => {
        test('should return 200 with portfolios on success', async () => {
            const mockPortfolios = [{ id: 1, name: 'Main' }];
            mock.method(PortfolioService, 'getAllPortfolios', async () => mockPortfolios);

            const res = mockRes();
            await PortfolioController.getPortfolios({}, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, mockPortfolios);
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
            const mockPortfolio = { id: 1, name: 'Main' };
            mock.method(PortfolioService, 'getPortfolio', async () => mockPortfolio);

            const res = mockRes();
            await PortfolioController.getPortfolio({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, mockPortfolio);
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
            await PortfolioController.getPortfolio({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('createPortfolio', () => {
        test('should return 201 on success', async () => {
            const mockPortfolio = { id: 1, name: 'Main', balance: 10000 };
            mock.method(PortfolioService, 'createPortfolio', async () => mockPortfolio);

            const res = mockRes();
            await PortfolioController.createPortfolio({ body: { portName: 'Main', balance: 10000 } }, res);

            assert.strictEqual(res.statusCode, 201);
            assert.deepStrictEqual(res.body, mockPortfolio);
        });

        test('should return 400 when portName is missing', async () => {
            const res = mockRes();
            await PortfolioController.createPortfolio({ body: { balance: 10000 } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 400 when balance is not a number', async () => {
            const res = mockRes();
            await PortfolioController.createPortfolio({ body: { portName: 'Main', balance: 'ten thousand' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });

        test('should return 500 on service error', async () => {
            mock.method(PortfolioService, 'createPortfolio', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.createPortfolio({ body: { portName: 'Main', balance: 10000 } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('updateBalance', () => {
        test('should return 200 on success', async () => {
            const mockPortfolio = { id: 1, balance: 15000 };
            mock.method(PortfolioService, 'updateBalance', async () => mockPortfolio);

            const res = mockRes();
            await PortfolioController.updateBalance({ body: { id: 1, incrementValue: 5000 } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, mockPortfolio);
        });

        test('should return 404 when service returns null', async () => {
            mock.method(PortfolioService, 'updateBalance', async () => null);

            const res = mockRes();
            await PortfolioController.updateBalance({ body: { id: 999, incrementValue: 5000 } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 500 on service error', async () => {
            mock.method(PortfolioService, 'updateBalance', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.updateBalance({ body: { id: 1, incrementValue: 5000 } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('rebateBalance', () => {
        test('should return 200 on success', async () => {
            const mockPortfolio = { id: 1, balance: 5000 };
            mock.method(PortfolioService, 'rebateBalance', async () => mockPortfolio);

            const res = mockRes();
            await PortfolioController.rebateBalance({ params: { id: '1' }, body: { decrementValue: 5000 } }, res);

            assert.strictEqual(res.statusCode, 200);
            assert.deepStrictEqual(res.body, mockPortfolio);
        });

        test('should return 404 when service returns null', async () => {
            mock.method(PortfolioService, 'rebateBalance', async () => null);

            const res = mockRes();
            await PortfolioController.rebateBalance({ params: { id: '999' }, body: { decrementValue: 5000 } }, res);

            assert.strictEqual(res.statusCode, 404);
        });

        test('should return 500 on service error', async () => {
            mock.method(PortfolioService, 'rebateBalance', async () => { throw new Error('DB error'); });

            const res = mockRes();
            await PortfolioController.rebateBalance({ params: { id: '1' }, body: { decrementValue: 5000 } }, res);

            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('deletePortfolio', () => {
        test('should return 200 on success', async () => {
            mock.method(PortfolioService, 'deletePortfolio', async () => [{ id: 1 }]);

            const res = mockRes();
            await PortfolioController.deletePortfolio({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 200);
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
            await PortfolioController.deletePortfolio({ params: { id: '1' } }, res);

            assert.strictEqual(res.statusCode, 400);
        });
    });
});
