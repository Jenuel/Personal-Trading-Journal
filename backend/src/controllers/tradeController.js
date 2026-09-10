import { TradeService } from "../services/tradeService.js";
import { tradeToApi, tradesToApi, tradeToRow } from "../mappers/trade.js";

const DIRECTIONS = ['LONG', 'SHORT'];

function firstRow(results) {
    return Array.isArray(results) ? results[0] : results;
}

export const TradeController = {
    getTrades: async (request, response) => {
        // Serves both /trades/port/:id and /trades?portfolioId=
        const portfolioId = request.params?.id ?? request.query?.portfolioId;

        try {
            const results = await TradeService.getAllTrades(portfolioId);

            // An account with no trades yet is a normal state, not a 404.
            return response.status(200).json(tradesToApi(results));
        } catch (error) {
            return response.status(500).send({ message: 'Error fetching trades', error: error.message })
        }
    },

    getTrade: async (request, response) => {
        const { id } = request.params
        try {
            const result = await TradeService.getTrade(id);

            if (!result) {
                return response.status(404).json({ message: 'Trade not found' });
            }

            return response.status(200).json(tradeToApi(result));
        } catch (error) {
            return response.status(500).send({ message: 'Error fetching trade', error: error.message })
        }
    },

    createTrade: async (request, response) => {
        const { portfolioId, pair, direction, lots, entryPrice, date } = request.body ?? {};

        if (!portfolioId) {
            return response.status(400).json({ message: 'portfolioId is required' });
        }

        if (typeof pair !== 'string' || pair.trim() === '') {
            return response.status(400).json({ message: 'pair is required' });
        }

        if (!DIRECTIONS.includes(direction)) {
            return response.status(400).json({ message: `direction must be one of ${DIRECTIONS.join(', ')}` });
        }

        if (typeof lots !== 'number' || Number.isNaN(lots)) {
            return response.status(400).json({ message: 'lots must be a number' });
        }

        if (typeof entryPrice !== 'number' || Number.isNaN(entryPrice)) {
            return response.status(400).json({ message: 'entryPrice must be a number' });
        }

        if (!date) {
            return response.status(400).json({ message: 'date is required' });
        }

        try {
            const results = await TradeService.createTrade(tradeToRow(request.body));
            return response.status(201).json(tradeToApi(firstRow(results)));
        } catch (error) {
            return response.status(500).send({ message: 'Error creating trade', error: error.message })
        }
    },

    updateTrade: async (request, response) => {
        const { id } = request.params;
        const { direction } = request.body ?? {};

        if (direction !== undefined && !DIRECTIONS.includes(direction)) {
            return response.status(400).json({ message: `direction must be one of ${DIRECTIONS.join(', ')}` });
        }

        const updates = tradeToRow(request.body);

        if (Object.keys(updates).length === 0) {
            return response.status(400).json({ message: 'No updatable fields supplied' });
        }

        try {
            const results = await TradeService.updateTrade(id, updates);

            if (!results || results.length === 0) {
                return response.status(404).json({ message: 'Trade not found' });
            }

            return response.status(200).json(tradeToApi(firstRow(results)));
        } catch (error) {
            return response.status(400).json({ message: "Error updating trade", error: error.message });
        }
    },

    deleteTrade: async (request, response) => {
        const { id } = request.params
        try {
            const results = await TradeService.deleteTrade(id);

            if (!results || results.length === 0) {
                return response.status(404).json({ message: 'Trade not found' });
            }

            return response.status(200).json({ message: 'Trade deleted successfully', trade: tradeToApi(firstRow(results)) });
        } catch (error) {
            return response.status(400).json({ message: 'Error deleting trade', error: error.message });
        }
    }
};
