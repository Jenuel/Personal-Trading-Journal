import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { PortfolioService } from '../../src/services/portService.js';
import { PortfolioRepository } from '../../src/repositories/portfolio.js';

describe('PortfolioService', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    test('createPortfolio should return results on success', async () => {
        const mockPortfolio = { id: 1, name: 'Main', balance: 10000 };
        mock.method(PortfolioRepository, 'createPortfolio', async () => mockPortfolio);

        const result = await PortfolioService.createPortfolio('Main', 10000);
        assert.deepStrictEqual(result, mockPortfolio);
        assert.strictEqual(PortfolioRepository.createPortfolio.mock.callCount(), 1);
        assert.deepStrictEqual(PortfolioRepository.createPortfolio.mock.calls[0].arguments, [{ name: 'Main', balance: 10000 }]);
    });

    test('createPortfolio should throw an error on failure', async () => {
        mock.method(PortfolioRepository, 'createPortfolio', async () => null);

        await assert.rejects(
            async () => await PortfolioService.createPortfolio('Main', 10000),
            { message: 'Failed to create portfolio' }
        );
        assert.strictEqual(PortfolioRepository.createPortfolio.mock.callCount(), 1);
    });

    test('getAllPortfolios should return results on success', async () => {
        const mockPortfolios = [{ id: 1, name: 'Main' }, { id: 2, name: 'Retirement' }];
        mock.method(PortfolioRepository, 'getAllPortfolios', async () => mockPortfolios);

        const result = await PortfolioService.getAllPortfolios();
        assert.deepStrictEqual(result, mockPortfolios);
        assert.strictEqual(PortfolioRepository.getAllPortfolios.mock.callCount(), 1);
    });

    test('getAllPortfolios should throw an error on failure', async () => {
        mock.method(PortfolioRepository, 'getAllPortfolios', async () => null);

        await assert.rejects(
            async () => await PortfolioService.getAllPortfolios(),
            { message: 'Failed to fetch portfolios' }
        );
        assert.strictEqual(PortfolioRepository.getAllPortfolios.mock.callCount(), 1);
    });

    test('getPortfolio should return result on success', async () => {
        const mockPortfolio = { id: 1, name: 'Main' };
        mock.method(PortfolioRepository, 'getPortfolioById', async () => mockPortfolio);

        const result = await PortfolioService.getPortfolio(1);
        assert.deepStrictEqual(result, mockPortfolio);
        assert.strictEqual(PortfolioRepository.getPortfolioById.mock.callCount(), 1);
        assert.deepStrictEqual(PortfolioRepository.getPortfolioById.mock.calls[0].arguments, [1]);
    });

    test('getPortfolio should throw an error on failure', async () => {
        mock.method(PortfolioRepository, 'getPortfolioById', async () => null);

        await assert.rejects(
            async () => await PortfolioService.getPortfolio(1),
            { message: 'Failed to fetch portfolio' }
        );
        assert.strictEqual(PortfolioRepository.getPortfolioById.mock.callCount(), 1);
    });

    test('updateBalance should return result on success', async () => {
        const currentPortfolio = { id: 1, name: 'Main', balance: 10000 };
        const updatedPortfolio = { id: 1, name: 'Main', balance: 15000 };
        mock.method(PortfolioRepository, 'getPortfolioById', async () => currentPortfolio);
        mock.method(PortfolioRepository, 'updatePortfolio', async () => updatedPortfolio);

        const result = await PortfolioService.updateBalance(1, 5000);
        assert.deepStrictEqual(result, updatedPortfolio);
        assert.deepStrictEqual(PortfolioRepository.getPortfolioById.mock.calls[0].arguments, [1]);
        assert.deepStrictEqual(PortfolioRepository.updatePortfolio.mock.calls[0].arguments, [1, { balance: 15000 }]);
    });

    test('updateBalance should throw when portfolio not found', async () => {
        mock.method(PortfolioRepository, 'getPortfolioById', async () => null);

        await assert.rejects(
            async () => await PortfolioService.updateBalance(1, 5000),
            { message: 'Portfolio not found' }
        );
        assert.strictEqual(PortfolioRepository.getPortfolioById.mock.callCount(), 1);
    });

    test('updateBalance should throw when update fails', async () => {
        const currentPortfolio = { id: 1, name: 'Main', balance: 10000 };
        mock.method(PortfolioRepository, 'getPortfolioById', async () => currentPortfolio);
        mock.method(PortfolioRepository, 'updatePortfolio', async () => null);

        await assert.rejects(
            async () => await PortfolioService.updateBalance(1, 5000),
            { message: 'Failed to update balance' }
        );
    });

    test('rebateBalance should return result on success', async () => {
        const currentPortfolio = { id: 1, name: 'Main', balance: 10000 };
        const updatedPortfolio = { id: 1, name: 'Main', balance: 7000 };
        mock.method(PortfolioRepository, 'getPortfolioById', async () => currentPortfolio);
        mock.method(PortfolioRepository, 'updatePortfolio', async () => updatedPortfolio);

        const result = await PortfolioService.rebateBalance(1, 3000);
        assert.deepStrictEqual(result, updatedPortfolio);
        assert.deepStrictEqual(PortfolioRepository.getPortfolioById.mock.calls[0].arguments, [1]);
        assert.deepStrictEqual(PortfolioRepository.updatePortfolio.mock.calls[0].arguments, [1, { balance: 7000 }]);
    });

    test('rebateBalance should throw when portfolio not found', async () => {
        mock.method(PortfolioRepository, 'getPortfolioById', async () => null);

        await assert.rejects(
            async () => await PortfolioService.rebateBalance(1, 3000),
            { message: 'Portfolio not found' }
        );
        assert.strictEqual(PortfolioRepository.getPortfolioById.mock.callCount(), 1);
    });

    test('rebateBalance should throw when update fails', async () => {
        const currentPortfolio = { id: 1, name: 'Main', balance: 10000 };
        mock.method(PortfolioRepository, 'getPortfolioById', async () => currentPortfolio);
        mock.method(PortfolioRepository, 'updatePortfolio', async () => null);

        await assert.rejects(
            async () => await PortfolioService.rebateBalance(1, 3000),
            { message: 'Failed to update balance' }
        );
    });

    test('deletePortfolio should return result on success', async () => {
        const mockResult = { id: 1, deleted: true };
        mock.method(PortfolioRepository, 'deletePortfolio', async () => mockResult);

        const result = await PortfolioService.deletePortfolio(1);
        assert.deepStrictEqual(result, mockResult);
        assert.strictEqual(PortfolioRepository.deletePortfolio.mock.callCount(), 1);
        assert.deepStrictEqual(PortfolioRepository.deletePortfolio.mock.calls[0].arguments, [1]);
    });

    test('deletePortfolio should throw an error on failure', async () => {
        mock.method(PortfolioRepository, 'deletePortfolio', async () => null);

        await assert.rejects(
            async () => await PortfolioService.deletePortfolio(1),
            { message: 'Failed to delete portfolio' }
        );
        assert.strictEqual(PortfolioRepository.deletePortfolio.mock.callCount(), 1);
    });
});
