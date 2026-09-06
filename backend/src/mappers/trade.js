import { createMapper } from './mapping.js';

const FIELDS = {
    id: 'id',
    portfolioId: 'portfolio_id',
    pair: 'pair',
    direction: 'direction',
    lots: 'lots',
    entryPrice: 'entry_price',
    exitPrice: 'exit_price',
    stopLoss: 'stop_loss',
    takeProfit: 'take_profit',
    pips: 'pips',
    result: 'result',
    rr: 'rr',
    outcome: 'outcome',
    session: 'session',
    setup: 'setup',
    date: 'date',
    notes: 'notes',
    createdAt: 'created_at',
};

const NUMERIC_FIELDS = ['lots', 'entryPrice', 'exitPrice', 'stopLoss', 'takeProfit', 'pips', 'result', 'rr'];

export const TradeMapper = createMapper({
    fields: FIELDS,
    numericFields: NUMERIC_FIELDS,
    readOnly: ['id', 'createdAt'],
});

export const tradeToApi = TradeMapper.toApi;
export const tradeToRow = TradeMapper.toRow;
export const tradesToApi = (rows) => (rows ?? []).map(tradeToApi);
