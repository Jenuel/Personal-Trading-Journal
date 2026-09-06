import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { PortfolioService } from '../../src/services/portService.js';
import { PortfolioRepository } from '../../src/repositories/portfolio.js';

describe('PortfolioService', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    test('createPortfolio should seed the current balance from the initial balance', async () => {
        const mockPortfolio = [{ id: 1, name: 'Main', initial_balance: 10000, current_balance: 10000 }];
        mock.method(PortfolioRepository, 'createPortfolio', async () => mockPortfolio);

        const result = await PortfolioService.createPortfolio({ name: 'Main', initial_balance: 10000 });
        assert.deepStrictEqual(result, mockPortfolio);
        assert.strictEqual(PortfolioRepository.createPortfolio.mock.callCount(), 1);
        assert.deepStrictEqual(PortfolioRepository.createPortfolio.mock.calls[0].arguments, [
            { name: 'Main', initial_balance: 10000, current_balance: 10000 },
        ]);
    });

    test('createPortfolio should throw an error on failure', async () => {
        mock.method(PortfolioRepository, 'createPortfolio', async () => null);

        await assert.rejects(
            async () => await PortfolioService.createPortfolio({ name: 'Main', initial_balance: 10000 }),
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

    test('getPortfolio should pass a missing portfolio through as null', async () => {
        mock.method(PortfolioRepository, 'getPortfolioById', async () => null);

        const result = await PortfolioService.getPortfolio(999);
        assert.strictEqual(result, null);
    });

    test('updatePortfolio should stamp updated_at alongside the updates', async () => {
        const updated = [{ id: 1, name: 'Renamed' }];
        mock.method(PortfolioRepository, 'updatePortfolio', async () => updated);

        const result = await PortfolioService.updatePortfolio(1, { name: 'Renamed' });
        assert.deepStrictEqual(result, updated);

        const [id, updates] = PortfolioRepository.updatePortfolio.mock.calls[0].arguments;
        assert.strictEqual(id, 1);
        assert.strictEqual(updates.name, 'Renamed');
        assert.ok(updates.updated_at, 'expected updated_at to be set');
    });

    test('updatePortfolio should throw an error on failure', async () => {
        mock.method(PortfolioRepository, 'updatePortfolio', async () => null);

        await assert.rejects(
            async () => await PortfolioService.updatePortfolio(1, { name: 'Renamed' }),
            { message: 'Failed to update portfolio' }
        );
    });

    describe('recalculateBalance', () => {
        test('should add realized P&L to the initial balance', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => ({
                id: 1,
                initial_balance: 10000,
                trades: [{ result: 335 }, { result: -201 }, { result: 182.5 }],
                cash_transactions: [],
            }));
            mock.method(PortfolioRepository, 'updatePortfolio', async () => [{ id: 1 }]);

            await PortfolioService.recalculateBalance(1);

            const [, updates] = PortfolioRepository.updatePortfolio.mock.calls[0].arguments;
            assert.strictEqual(updates.current_balance, 10316.5);
        });

        test('should apply deposits and withdrawals', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => ({
                id: 1,
                initial_balance: 10000,
                trades: [{ result: 500 }],
                cash_transactions: [
                    { type: 'DEPOSIT', amount: 2000 },
                    { type: 'WITHDRAWAL', amount: 750 },
                ],
            }));
            mock.method(PortfolioRepository, 'updatePortfolio', async () => [{ id: 1 }]);

            await PortfolioService.recalculateBalance(1);

            const [, updates] = PortfolioRepository.updatePortfolio.mock.calls[0].arguments;
            assert.strictEqual(updates.current_balance, 11750);
        });

        test('should ignore open trades with no result yet', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => ({
                id: 1,
                initial_balance: 10000,
                trades: [{ result: null }, { result: undefined }, { result: 100 }],
                cash_transactions: [],
            }));
            mock.method(PortfolioRepository, 'updatePortfolio', async () => [{ id: 1 }]);

            await PortfolioService.recalculateBalance(1);

            const [, updates] = PortfolioRepository.updatePortfolio.mock.calls[0].arguments;
            assert.strictEqual(updates.current_balance, 10100);
        });

        test('should fall back to the initial balance for an empty account', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => ({
                id: 1,
                initial_balance: 10000,
            }));
            mock.method(PortfolioRepository, 'updatePortfolio', async () => [{ id: 1 }]);

            await PortfolioService.recalculateBalance(1);

            const [, updates] = PortfolioRepository.updatePortfolio.mock.calls[0].arguments;
            assert.strictEqual(updates.current_balance, 10000);
        });

        test('should round to cents rather than leak float noise', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => ({
                id: 1,
                initial_balance: 0,
                trades: [{ result: 0.1 }, { result: 0.2 }],
                cash_transactions: [],
            }));
            mock.method(PortfolioRepository, 'updatePortfolio', async () => [{ id: 1 }]);

            await PortfolioService.recalculateBalance(1);

            const [, updates] = PortfolioRepository.updatePortfolio.mock.calls[0].arguments;
            assert.strictEqual(updates.current_balance, 0.3);
        });

        test('should throw when the portfolio does not exist', async () => {
            mock.method(PortfolioRepository, 'getPortfolioById', async () => null);

            await assert.rejects(
                async () => await PortfolioService.recalculateBalance(999),
                { message: 'Portfolio not found' }
            );
        });
    });

    test('deletePortfolio should return result on success', async () => {
        const mockResult = [{ id: 1 }];
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
