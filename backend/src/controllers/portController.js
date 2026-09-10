import { PortfolioService } from '../services/portService.js';
import { portfolioToApi, portfoliosToApi, portfolioToRow } from '../mappers/portfolio.js';

const ACCOUNT_TYPES = ['LIVE', 'DEMO', 'PROP'];

function firstRow(results) {
    return Array.isArray(results) ? results[0] : results;
}

export const PortfolioController = {
    getPortfolios: async (request, response) => {
        try {
            const results = await PortfolioService.getAllPortfolios();
            return response.status(200).json(portfoliosToApi(results));
        } catch (error) {
            console.error('Error fetching portfolios:', error.message);
            return response.status(500).json({ message: 'Error fetching portfolios', error: error.message });
        }
    },

    getPortfolio: async (request, response) => {
        const { id } = request.params;
        try {
            const results = await PortfolioService.getPortfolio(id);

            if (!results) {
                return response.status(404).json({ error: 'Portfolio not found' });
            }

            return response.status(200).json(portfolioToApi(results));
        } catch (error) {
            console.error('Error fetching portfolio:', error.message);
            return response.status(500).json({ message: 'Error fetching portfolio', error: error.message });
        }
    },

    createPortfolio: async (request, response) => {
        const { name, initialBalance, accountType } = request.body ?? {};

        if (typeof name !== 'string' || name.trim() === '') {
            return response.status(400).json({ message: 'name is required' });
        }

        if (typeof initialBalance !== 'number' || Number.isNaN(initialBalance)) {
            return response.status(400).json({ message: 'initialBalance must be a number' });
        }

        if (accountType !== undefined && !ACCOUNT_TYPES.includes(accountType)) {
            return response.status(400).json({ message: `accountType must be one of ${ACCOUNT_TYPES.join(', ')}` });
        }

        try {
            const results = await PortfolioService.createPortfolio(portfolioToRow(request.body));
            return response.status(201).json(portfolioToApi(firstRow(results)));
        } catch (error) {
            console.error('Error creating portfolio:', error.message);
            return response.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    },

    updatePortfolio: async (request, response) => {
        const { id } = request.params;
        const { accountType } = request.body ?? {};

        if (accountType !== undefined && !ACCOUNT_TYPES.includes(accountType)) {
            return response.status(400).json({ message: `accountType must be one of ${ACCOUNT_TYPES.join(', ')}` });
        }

        // The edit dialog submits its whole form, initialBalance included, even
        // though it disables that input. The balance is derived from it, so it
        // stays fixed once the account exists — drop it rather than reject the edit.
        const { initial_balance, ...updates } = portfolioToRow(request.body);

        if (Object.keys(updates).length === 0) {
            return response.status(400).json({ message: 'No updatable fields supplied' });
        }

        try {
            const results = await PortfolioService.updatePortfolio(id, updates);

            if (!results || (Array.isArray(results) && results.length === 0)) {
                return response.status(404).json({ error: 'Portfolio not found' });
            }

            return response.status(200).json(portfolioToApi(firstRow(results)));
        } catch (error) {
            console.error('Error updating portfolio:', error.message);
            return response.status(500).json({ message: 'Error updating portfolio', error: error.message });
        }
    },

    deletePortfolio: async (request, response) => {
        const { id } = request.params;

        try {
            const results = await PortfolioService.deletePortfolio(id);

            if (!results || (Array.isArray(results) && results.length === 0)) {
                return response.status(404).json({ error: 'Portfolio not found' });
            }

            return response.status(200).json({ message: 'Portfolio deleted successfully' });
        } catch (error) {
            console.error('Error deleting portfolio:', error.message);
            return response.status(400).json({ error: 'Error deleting portfolio', message: error.message });
        }
    }
};
