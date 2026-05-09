import { PortfolioRepository as portfolioRepository } from "../repositories/portfolio.js";

export const PortfolioService = {
    createPortfolio: async (name, balance) => {
        const results = await portfolioRepository.createPortfolio(name, balance);

        if (!results) {
            throw new Error('Failed to create portfolio');
        }

        return results;
    },

    getAllPortfolios: async () => {
        const results = await portfolioRepository.getAllPortfolios();

        if (!results) {
            throw new Error('Failed to fetch portfolios');
        }

        return results;
    },

    getPortfolio: async (id) => {
        const results = await portfolioRepository.getPortfolio(id);

        if (!results) {
            throw new Error('Failed to fetch portfolio');
        }

        return results;
    },

    updateBalance: async (id, balance) => {
        const results = await portfolioRepository.updateBalance(id, balance);

        if (!results) {
            throw new Error('Failed to update balance');
        }

        return results;
    },

    deletePortfolio: async (id) => {
        const results = await portfolioRepository.deletePortfolio(id);

        if (!results) {
            throw new Error('Failed to delete portfolio');
        }

        return results;
    }
}