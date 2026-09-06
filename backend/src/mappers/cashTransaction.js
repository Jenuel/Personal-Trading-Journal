import { createMapper } from './mapping.js';

const FIELDS = {
    id: 'id',
    portfolioId: 'portfolio_id',
    type: 'type',
    amount: 'amount',
    date: 'date',
    notes: 'notes',
    createdAt: 'created_at',
};

export const CashTransactionMapper = createMapper({
    fields: FIELDS,
    numericFields: ['amount'],
    readOnly: ['id', 'createdAt'],
});

export const cashTransactionToApi = CashTransactionMapper.toApi;
export const cashTransactionToRow = CashTransactionMapper.toRow;
export const cashTransactionsToApi = (rows) => (rows ?? []).map(cashTransactionToApi);
