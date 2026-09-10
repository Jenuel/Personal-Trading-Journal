import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { TradeService } from '../../src/services/tradeService.js';
import { TradeRepository } from '../../src/repositories/trade.js';
import { PortfolioService } from '../../src/services/portService.js';

const FX_TRADE = {
    id: 1,
    portfolio_id: 'p1',
    pair: 'EURUSD',
    direction: 'LONG',
    lots: 0.5,
    entry_price: 1.0845,
    result: 335,
};

describe('TradeService', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    test('createTrade should return results on success', async () => {
        mock.method(TradeRepository, 'createTrade', async () => [FX_TRADE]);
        mock.method(PortfolioService, 'recalculateBalance', async () => [{ id: 'p1' }]);

        const result = await TradeService.createTrade(FX_TRADE);
        assert.deepStrictEqual(result, [FX_TRADE]);
        assert.strictEqual(TradeRepository.createTrade.mock.callCount(), 1);
        assert.deepStrictEqual(TradeRepository.createTrade.mock.calls[0].arguments, [FX_TRADE]);
    });

    test('createTrade should recalculate the account balance', async () => {
        mock.method(TradeRepository, 'createTrade', async () => [FX_TRADE]);
        mock.method(PortfolioService, 'recalculateBalance', async () => [{ id: 'p1' }]);

        await TradeService.createTrade(FX_TRADE);

        assert.strictEqual(PortfolioService.recalculateBalance.mock.callCount(), 1);
        assert.deepStrictEqual(PortfolioService.recalculateBalance.mock.calls[0].arguments, ['p1']);
    });

    test('createTrade should throw an error on failure', async () => {
        mock.method(TradeRepository, 'createTrade', async () => null);

        await assert.rejects(
            async () => await TradeService.createTrade({}),
            { message: 'Failed to create trade' }
        );
        assert.strictEqual(TradeRepository.createTrade.mock.callCount(), 1);
    });

    // Regression guard: this used to select the entire trades table regardless
    // of which account was asked for.
    test('getAllTrades should filter by portfolio when given an id', async () => {
        const mockTrades = [FX_TRADE];
        mock.method(TradeRepository, 'getTradesByPortfolioId', async () => mockTrades);
        mock.method(TradeRepository, 'getAllTrades', async () => []);

        const result = await TradeService.getAllTrades('p1');

        assert.deepStrictEqual(result, mockTrades);
        assert.strictEqual(TradeRepository.getTradesByPortfolioId.mock.callCount(), 1);
        assert.deepStrictEqual(TradeRepository.getTradesByPortfolioId.mock.calls[0].arguments, ['p1']);
        assert.strictEqual(TradeRepository.getAllTrades.mock.callCount(), 0);
    });

    test('getAllTrades should return every trade when given no id', async () => {
        const mockTrades = [FX_TRADE, { ...FX_TRADE, id: 2, portfolio_id: 'p2' }];
        mock.method(TradeRepository, 'getAllTrades', async () => mockTrades);
        mock.method(TradeRepository, 'getTradesByPortfolioId', async () => []);

        const result = await TradeService.getAllTrades();

        assert.deepStrictEqual(result, mockTrades);
        assert.strictEqual(TradeRepository.getAllTrades.mock.callCount(), 1);
        assert.strictEqual(TradeRepository.getTradesByPortfolioId.mock.callCount(), 0);
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
        mock.method(TradeRepository, 'getTradeById', async () => FX_TRADE);

        const result = await TradeService.getTrade(1);
        assert.deepStrictEqual(result, FX_TRADE);
        assert.strictEqual(TradeRepository.getTradeById.mock.callCount(), 1);
        assert.deepStrictEqual(TradeRepository.getTradeById.mock.calls[0].arguments, [1]);
    });

    test('getTrade should pass a missing trade through as null', async () => {
        mock.method(TradeRepository, 'getTradeById', async () => null);

        const result = await TradeService.getTrade(999);
        assert.strictEqual(result, null);
    });

    test('updateTrade should return result and recalculate the balance', async () => {
        const updated = [{ ...FX_TRADE, result: 400 }];
        mock.method(TradeRepository, 'updateTrade', async () => updated);
        mock.method(PortfolioService, 'recalculateBalance', async () => [{ id: 'p1' }]);

        const result = await TradeService.updateTrade(1, { result: 400 });
        assert.deepStrictEqual(result, updated);
        assert.deepStrictEqual(TradeRepository.updateTrade.mock.calls[0].arguments, [1, { result: 400 }]);
        assert.deepStrictEqual(PortfolioService.recalculateBalance.mock.calls[0].arguments, ['p1']);
    });

    test('updateTrade should throw an error on failure', async () => {
        mock.method(TradeRepository, 'updateTrade', async () => null);

        await assert.rejects(
            async () => await TradeService.updateTrade(1, {}),
            { message: 'Failed to update trade' }
        );
        assert.strictEqual(TradeRepository.updateTrade.mock.callCount(), 1);
    });

    test('deleteTrade should return result and recalculate the balance', async () => {
        mock.method(TradeRepository, 'deleteTrade', async () => [FX_TRADE]);
        mock.method(PortfolioService, 'recalculateBalance', async () => [{ id: 'p1' }]);

        const result = await TradeService.deleteTrade(1);
        assert.deepStrictEqual(result, [FX_TRADE]);
        assert.deepStrictEqual(TradeRepository.deleteTrade.mock.calls[0].arguments, [1]);
        assert.deepStrictEqual(PortfolioService.recalculateBalance.mock.calls[0].arguments, ['p1']);
    });

    test('deleteTrade should not recalculate when nothing was deleted', async () => {
        mock.method(TradeRepository, 'deleteTrade', async () => []);
        mock.method(PortfolioService, 'recalculateBalance', async () => [{ id: 'p1' }]);

        await TradeService.deleteTrade(999);

        assert.strictEqual(PortfolioService.recalculateBalance.mock.callCount(), 0);
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
