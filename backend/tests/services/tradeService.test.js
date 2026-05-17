import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { TradeService } from '../../src/services/tradeService.js';
import { TradeRepository } from '../../src/repositories/trade.js';

describe('TradeService', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    test('createTrade should return results on success', async () => {
        const mockTrade = { id: 1, symbol: 'AAPL', quantity: 10 };
        mock.method(TradeRepository, 'createTrade', async () => mockTrade);

        const result = await TradeService.createTrade(mockTrade);
        assert.deepStrictEqual(result, mockTrade);
        assert.strictEqual(TradeRepository.createTrade.mock.callCount(), 1);
        assert.deepStrictEqual(TradeRepository.createTrade.mock.calls[0].arguments, [mockTrade]);
    });

    test('createTrade should throw an error on failure', async () => {
        mock.method(TradeRepository, 'createTrade', async () => null);

        await assert.rejects(
            async () => await TradeService.createTrade({}),
            { message: 'Failed to create trade' }
        );
        assert.strictEqual(TradeRepository.createTrade.mock.callCount(), 1);
    });

    test('getAllTrades should return results on success', async () => {
        const mockTrades = [{ id: 1, symbol: 'AAPL' }, { id: 2, symbol: 'MSFT' }];
        mock.method(TradeRepository, 'getAllTrades', async () => mockTrades);

        const result = await TradeService.getAllTrades();
        assert.deepStrictEqual(result, mockTrades);
        assert.strictEqual(TradeRepository.getAllTrades.mock.callCount(), 1);
    });

    test('getAllTrades should throw an error on failure', async () => {
        mock.method(TradeRepository, 'getAllTrades', async () => null);

        await assert.rejects(
            async () => await TradeService.getAllTrades(),
            { message: 'Failed to fetch trades' }
        );
        assert.strictEqual(TradeRepository.getAllTrades.mock.callCount(), 1);
    });

    test('getTrade should return result on success', async () => {
        const mockTrade = { id: 1, symbol: 'AAPL' };
        mock.method(TradeRepository, 'getTradeById', async () => mockTrade);

        const result = await TradeService.getTrade(1);
        assert.deepStrictEqual(result, mockTrade);
        assert.strictEqual(TradeRepository.getTradeById.mock.callCount(), 1);
        assert.deepStrictEqual(TradeRepository.getTradeById.mock.calls[0].arguments, [1]);
    });

    test('getTrade should throw an error on failure', async () => {
        mock.method(TradeRepository, 'getTradeById', async () => null);

        await assert.rejects(
            async () => await TradeService.getTrade(1),
            { message: 'Failed to fetch trade' }
        );
        assert.strictEqual(TradeRepository.getTradeById.mock.callCount(), 1);
    });

    test('updateTrade should return result on success', async () => {
        const mockTrade = { id: 1, symbol: 'AAPL', quantity: 20 };
        mock.method(TradeRepository, 'updateTrade', async () => mockTrade);

        const result = await TradeService.updateTrade(1, { quantity: 20 });
        assert.deepStrictEqual(result, mockTrade);
        assert.strictEqual(TradeRepository.updateTrade.mock.callCount(), 1);
        assert.deepStrictEqual(TradeRepository.updateTrade.mock.calls[0].arguments, [1, { quantity: 20 }]);
    });

    test('updateTrade should throw an error on failure', async () => {
        mock.method(TradeRepository, 'updateTrade', async () => null);

        await assert.rejects(
            async () => await TradeService.updateTrade(1, {}),
            { message: 'Failed to update trade' }
        );
        assert.strictEqual(TradeRepository.updateTrade.mock.callCount(), 1);
    });

    test('deleteTrade should return result on success', async () => {
        const mockResult = { id: 1, deleted: true };
        mock.method(TradeRepository, 'deleteTrade', async () => mockResult);

        const result = await TradeService.deleteTrade(1);
        assert.deepStrictEqual(result, mockResult);
        assert.strictEqual(TradeRepository.deleteTrade.mock.callCount(), 1);
        assert.deepStrictEqual(TradeRepository.deleteTrade.mock.calls[0].arguments, [1]);
    });

    test('deleteTrade should throw an error on failure', async () => {
        mock.method(TradeRepository, 'deleteTrade', async () => null);

        await assert.rejects(
            async () => await TradeService.deleteTrade(1),
            { message: 'Failed to delete trade' }
        );
        assert.strictEqual(TradeRepository.deleteTrade.mock.callCount(), 1);
    });
});
