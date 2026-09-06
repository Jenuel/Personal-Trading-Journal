import { createMapper } from './mapping.js';
import { tradesToApi } from './trade.js';
import { cashTransactionsToApi } from './cashTransaction.js';

const FIELDS = {
    id: 'id',
    name: 'name',
    description: 'description',
    initialBalance: 'initial_balance',
    currentBalance: 'current_balance',
    currency: 'currency',
    broker: 'broker',
    accountType: 'account_type',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
};

const BaseMapper = createMapper({
    fields: FIELDS,
    numericFields: ['initialBalance', 'currentBalance'],
    readOnly: ['id', 'createdAt', 'updatedAt'],
});

// Portfolios are fetched with their trades and cash transactions embedded,
// so the nested collections get mapped alongside the account's own columns.
export function portfolioToApi(row) {
    if (!row) {
        return row;
    }

    const portfolio = BaseMapper.toApi(row);

    if (row.trades !== undefined) {
        portfolio.trades = tradesToApi(row.trades);
    }
    if (row.cash_transactions !== undefined) {
        portfolio.cashTransactions = cashTransactionsToApi(row.cash_transactions);
    }

    return portfolio;
}

export const portfolioToRow = BaseMapper.toRow;
export const portfoliosToApi = (rows) => (rows ?? []).map(portfolioToApi);
