import { TradeRepository as tradeRepository } from "../repositories/trade.js";

export const TradeService = {
    createTrade: async (trade) => {
        const results = await tradeRepository.createTrade(trade);

        if (!results) {
            throw new Error('Failed to create trade');
        }

        return results;
    },

    getAllTrades: async () => {
        const results = await tradeRepository.getAllTrades();

        if (!results) {
            throw new Error('Failed to fetch trades');
        }

        return results;
    },

    getTrade: async (id) => {
        const results = await tradeRepository.getTrade(id);

        if (!results) {
            throw new Error('Failed to fetch trade');
        }

        return results;
    },

    updateTrade: async (id, trade) => {
        const results = await tradeRepository.updateTrade(id, trade);

        if (!results) {
            throw new Error('Failed to update trade');
        }

        return results;
    },

    deleteTrade: async (id) => {
        const results = await tradeRepository.deleteTrade(id);

        if (!results) {
            throw new Error('Failed to delete trade');
        }

        return results;
    }
}