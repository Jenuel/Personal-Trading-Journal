import { PortfolioRepository as portfolioRepository } from "../repositories/portfolio.js";

export const PortfolioService = {
    createPortfolio: async (name, balance) => {
        const portfolio = { name, balance };
        const results = await portfolioRepository.createPortfolio(portfolio);

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
        const results = await portfolioRepository.getPortfolioById(id);

        if (!results) {
            throw new Error('Failed to fetch portfolio');
        }

        return results;
    },

    updateBalance: async (id, incrementValue) => {
        const currentPortfolio = await portfolioRepository.getPortfolioById(id);
        if (!currentPortfolio) {
            throw new Error('Portfolio not found');
        }

        const newBalance = Number(currentPortfolio.balance) + Number(incrementValue);
        const results = await portfolioRepository.updatePortfolio(id, { balance: newBalance });

        if (!results) {
            throw new Error('Failed to update balance');
        }

        return results;
    },

    rebateBalance: async (id, decrementValue) => {
        const currentPortfolio = await portfolioRepository.getPortfolioById(id);
        if (!currentPortfolio) {
            throw new Error('Portfolio not found');
        }

        const newBalance = Number(currentPortfolio.balance) - Number(decrementValue);
        const results = await portfolioRepository.updatePortfolio(id, { balance: newBalance });

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