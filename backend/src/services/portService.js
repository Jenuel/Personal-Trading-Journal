import { PortfolioRepository as portfolioRepository } from "../repositories/portfolio.js";

function roundMoney(value) {
    return Math.round(value * 100) / 100;
}

export const PortfolioService = {
    createPortfolio: async (portfolio) => {
        // A new account starts out at whatever it was funded with.
        const results = await portfolioRepository.createPortfolio({
            ...portfolio,
            current_balance: portfolio.initial_balance,
        });

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

        if (results === undefined) {
            throw new Error('Failed to fetch portfolio');
        }

        return results;
    },

    updatePortfolio: async (id, updates) => {
        const results = await portfolioRepository.updatePortfolio(id, {
            ...updates,
            updated_at: new Date().toISOString(),
        });

        if (!results) {
            throw new Error('Failed to update portfolio');
        }

        return results;
    },

    // The balance is derived, never set by the client: it is the funded amount
    // plus realized P&L plus net deposits. Called after every write that can
    // move it.
    recalculateBalance: async (portfolioId) => {
        const portfolio = await portfolioRepository.getPortfolioById(portfolioId);

        if (!portfolio) {
            throw new Error('Portfolio not found');
        }

        const realized = (portfolio.trades ?? []).reduce(
            (sum, trade) => sum + Number(trade.result ?? 0),
            0
        );

        const netDeposits = (portfolio.cash_transactions ?? []).reduce(
            (sum, transaction) => transaction.type === 'DEPOSIT'
                ? sum + Number(transaction.amount)
                : sum - Number(transaction.amount),
            0
        );

        const currentBalance = roundMoney(
            Number(portfolio.initial_balance) + realized + netDeposits
        );

        const results = await portfolioRepository.updatePortfolio(portfolioId, {
            current_balance: currentBalance,
            updated_at: new Date().toISOString(),
        });

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
