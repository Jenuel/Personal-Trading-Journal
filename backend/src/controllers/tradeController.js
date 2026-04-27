import { TradeService } from "../services/tradeService.js";

export const TradeController = {
    getTrades: async (request, response) => {
        const { id } = request.params

        try {
            const results = await TradeService.getAllTrades(id);

            if (results.length === 0) {
                return response.status(404).json({ message: 'No trades found for this portfolio' });
            }

            response.status(200).json(results);
        } catch (error) {
            response.status(500).send({ message: 'Error fetching trades', error: error.message })
        }
    },

    getTrade: async (request, response) => {
        const { id } = request.params
        try {
            const results = await TradeService.getTrade(id);

            if (results.length === 0) {
                return response.status(404).json({ message: 'Trade not found' });
            }

            response.status(200).json(results.rows[0]);
        } catch (error) {
            response.status(500).send({ message: 'Error fetching trade', error: error.message })
        }
    },

    createTrade: async (request, response) => {
        const { body } = request
        try {
            console.log("Creating trade with data:", body);

            const { portId, symbol, quantity, price, type, date } = body;

            const result = await TradeService.createTrade(portId, symbol, quantity, price, type, date);

            console.log("Result:", result);
            response.status(201).json(result);

        } catch (error) {
            return response.status(500).send({ message: 'Error creating trade', error: error.message })
        }
    },

    updateTrade: async (request, response) => {
        const { id } = request.params;

        try {
            const { portId, symbol, quantity, price, type, date } = request.body;

            const result = await TradeService.updateTrade(id, portId, symbol, quantity, price, type, date);

            if (result.length === 0) {
                return response.status(404).json({ message: 'Trade not found' });
            }

            response.status(200).json(result);
        } catch (error) {
            return response.status(400).json({ message: "Error updating trade", error: error.message });
        }
    },

    deleteTrade: async (request, response) => {
        const { id } = request.params
        try {
            const result = await TradeService.deleteTrade(id);

            if (result.length === 0) {
                return response.status(404).json({ message: 'Trade not found' });
            }

            response.status(200).json({ message: 'Trade deleted successfully', trade: result.rows[0] });
        } catch (error) {
            return response.sendStatus(400);
        }
    }
};