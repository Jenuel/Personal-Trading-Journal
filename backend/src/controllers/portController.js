import { PortfolioService } from '../services/portService.js';

export const PortfolioController = {
    getPortfolios: async (request, response) => {
        try {
            const results = await PortfolioService.getAllPortfolios();
            return response.status(200).json(results);
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

            return response.status(200).json(results);
        } catch (error) {
            console.error('Error fetching portfolio:', error.message);
            return response.status(500).json({ message: 'Error fetching portfolio', error: error.message });
        }
    },

    createPortfolio: async (request, response) => {
        const { portName, balance } = request.body;

        if (!portName || typeof balance !== 'number') {
            return response.status(400).json({ error: 'Invalid input data' });
        }

        try {
            const result = await PortfolioService.createPortfolio(portName, balance);
            return response.status(201).json(result);
        } catch (error) {
            console.error('Error creating portfolio:', error.message);
            return response.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    },

    updateBalance: async (request, response) => {
        const { id, incrementValue } = request.body;

        try {
            const results = await PortfolioService.updateBalance(id, incrementValue);

            if (!results) {
                return response.status(404).json({ error: 'Portfolio not found' });
            }

            return response.status(200).json(results);
        } catch (error) {
            console.error('Error updating balance:', error.message);
            return response.status(500).json({ message: 'Error updating balance', error: error.message });
        }
    },

    rebateBalance: async (request, response) => {
        const { id } = request.params;
        const { decrementValue } = request.body;

        try {
            const results = await PortfolioService.rebateBalance(id, decrementValue);

            if (!results) {
                return response.status(404).json({ error: 'No such portfolio' });
            }

            return response.status(200).json(results);
        } catch (error) {
            console.error('Error rebating balance:', error.message);
            return response.status(500).json({ error: 'An error occurred', message: error.message });
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