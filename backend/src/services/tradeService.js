import { TradeRepository as tradeRepository } from "../repositories/trade.js";
import { PortfolioService } from "./portService.js";

function portfolioIdOf(rows) {
    const row = Array.isArray(rows) ? rows[0] : rows;
    return row?.portfolio_id;
}

export const TradeService = {
    createTrade: async (trade) => {
        const results = await tradeRepository.createTrade(trade);

        if (!results) {
            throw new Error('Failed to create trade');
        }

        await PortfolioService.recalculateBalance(trade.portfolio_id);

        return results;
    },

    getAllTrades: async (portfolioId) => {
        const results = portfolioId
            ? await tradeRepository.getTradesByPortfolioId(portfolioId)
            : await tradeRepository.getAllTrades();

        if (!results) {
            throw new Error('Failed to fetch trades');
        }

        return results;
    },

    getTrade: async (id) => {
        const results = await tradeRepository.getTradeById(id);

        if (results === undefined) {
            throw new Error('Failed to fetch trade');
        }

        return results;
    },

    updateTrade: async (id, updates) => {
        const results = await tradeRepository.updateTrade(id, updates);

        if (!results) {
            throw new Error('Failed to update trade');
        }

        const portfolioId = portfolioIdOf(results);
        if (portfolioId) {
            await PortfolioService.recalculateBalance(portfolioId);
        }

        return results;
    },

    deleteTrade: async (id) => {
        const results = await tradeRepository.deleteTrade(id);

        if (!results) {
            throw new Error('Failed to delete trade');
        }

        const portfolioId = portfolioIdOf(results);
        if (portfolioId) {
            await PortfolioService.recalculateBalance(portfolioId);
        }

        return results;
    }
}
