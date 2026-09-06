import { test, describe } from 'node:test';
import assert from 'node:assert';
import { portfolioToApi, portfolioToRow } from '../../src/mappers/portfolio.js';
import { tradeToApi, tradeToRow } from '../../src/mappers/trade.js';
import { cashTransactionToApi, cashTransactionToRow } from '../../src/mappers/cashTransaction.js';

describe('TradeMapper', () => {
    test('toApi should rename columns and coerce numerics', () => {
        const trade = tradeToApi({
            id: 't1',
            portfolio_id: 'p1',
            pair: 'EURUSD',
            direction: 'LONG',
            lots: '0.5',
            entry_price: '1.0845',
            exit_price: '1.0912',
            stop_loss: '1.0810',
            take_profit: '1.0920',
            pips: '67',
            result: '335',
            rr: '1.91',
            outcome: 'WIN',
            session: 'LONDON',
            setup: 'Break & Retest',
            date: '2026-09-01',
            notes: 'Clean break.',
            created_at: '2026-09-01T00:00:00Z',
        });

        assert.strictEqual(trade.portfolioId, 'p1');
        assert.strictEqual(trade.entryPrice, 1.0845);
        assert.strictEqual(trade.takeProfit, 1.0920);
        assert.strictEqual(trade.rr, 1.91);
        assert.strictEqual(trade.createdAt, '2026-09-01T00:00:00Z');
        assert.ok(!('entry_price' in trade));
    });

    test('toApi should leave a null numeric as null rather than zero', () => {
        const trade = tradeToApi({ id: 't1', exit_price: null, result: null });

        assert.strictEqual(trade.exitPrice, null);
        assert.strictEqual(trade.result, null);
    });

    // The partial-update guarantee: a field the caller omitted is never written.
    test('toRow should omit keys the caller did not supply', () => {
        const row = tradeToRow({ notes: 'Revised' });

        assert.deepStrictEqual(row, { notes: 'Revised' });
    });

    test('toRow should refuse to write read-only columns', () => {
        const row = tradeToRow({ id: 'forged', createdAt: '1999-01-01', notes: 'Revised' });

        assert.deepStrictEqual(row, { notes: 'Revised' });
    });

    test('toApi and toRow should round-trip', () => {
        const original = {
            portfolio_id: 'p1', pair: 'EURUSD', direction: 'LONG',
            lots: 0.5, entry_price: 1.0845, date: '2026-09-01',
        };

        assert.deepStrictEqual(tradeToRow(tradeToApi(original)), original);
    });
});

describe('PortfolioMapper', () => {
    test('toApi should rename columns and coerce balances', () => {
        const portfolio = portfolioToApi({
            id: 'p1',
            name: 'IC Markets Live',
            description: 'Primary',
            initial_balance: '10000',
            current_balance: '11240',
            currency: 'USD',
            broker: 'IC Markets',
            account_type: 'LIVE',
            created_at: '2026-07-01T00:00:00Z',
            updated_at: '2026-09-01T00:00:00Z',
        });

        assert.strictEqual(portfolio.initialBalance, 10000);
        assert.strictEqual(portfolio.currentBalance, 11240);
        assert.strictEqual(portfolio.accountType, 'LIVE');
        assert.ok(!('account_type' in portfolio));
    });

    test('toApi should map the embedded trades and cash transactions', () => {
        const portfolio = portfolioToApi({
            id: 'p1',
            name: 'Main',
            initial_balance: 10000,
            current_balance: 10000,
            trades: [{ id: 't1', portfolio_id: 'p1', entry_price: 1.0845 }],
            cash_transactions: [{ id: 'c1', portfolio_id: 'p1', type: 'DEPOSIT', amount: '500' }],
        });

        assert.strictEqual(portfolio.trades[0].entryPrice, 1.0845);
        assert.strictEqual(portfolio.cashTransactions[0].amount, 500);
    });

    test('toApi should leave the collections off when they were not fetched', () => {
        const portfolio = portfolioToApi({ id: 'p1', name: 'Main' });

        assert.ok(!('trades' in portfolio));
        assert.ok(!('cashTransactions' in portfolio));
    });

    test('toApi should pass null straight through', () => {
        assert.strictEqual(portfolioToApi(null), null);
    });

    test('toRow should omit keys the caller did not supply', () => {
        assert.deepStrictEqual(portfolioToRow({ broker: 'FTMO' }), { broker: 'FTMO' });
    });
});

describe('CashTransactionMapper', () => {
    test('toApi should rename columns and coerce the amount', () => {
        const transaction = cashTransactionToApi({
            id: 'c1', portfolio_id: 'p1', type: 'WITHDRAWAL',
            amount: '750', date: '2026-09-01', created_at: '2026-09-01T00:00:00Z',
        });

        assert.strictEqual(transaction.portfolioId, 'p1');
        assert.strictEqual(transaction.amount, 750);
        assert.strictEqual(transaction.createdAt, '2026-09-01T00:00:00Z');
    });

    test('toRow should omit keys the caller did not supply', () => {
        assert.deepStrictEqual(cashTransactionToRow({ notes: 'Revised' }), { notes: 'Revised' });
    });
});
