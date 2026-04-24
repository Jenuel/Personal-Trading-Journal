import { request } from 'express'
import pool from '../config/db.js'

const getTrades = async (request, response) => {
    const { id } = request.params

    try {
        const results = await pool.query(
            'SELECT * FROM trades WHERE portId = $1 ORDER BY createdAt DESC',
            [id]
        );

        if (results.rows.length === 0) {
            return response.status(404).json({ message: 'No trades found for this portfolio' });
        }

        response.status(200).json(results.rows);
    } catch (error) {
        response.status(500).send({ message: 'Error fetching trades', error: error.message })
    }
}


const getTrade = async (request, response) => {
    const { id } = request.params
    try {
        const results = await pool.query(
            'SELECT * FROM trades WHERE id = $1',
            [id]
        );

        if (results.rows.length === 0) {
            return response.status(404).json({ message: 'Trade not found' });
        }

        response.status(200).json(results.rows[0]);
    } catch (error) {
        response.status(500).send({ message: 'Error fetching trade', error: error.message })
    }
}

const createTrade = async (request, response) => {
    const { body } = request
    try {
        console.log("Creating trade with data:", body);

        const { portId, symbol, quantity, price, type, date } = body;

        const result = await pool.query(
            'INSERT INTO trades (portId, symbol, quantity, price, type, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [portId, symbol, quantity, price, type, date]
        );

        console.log("Result:", result.rows[0]);
        response.status(201).json(result.rows[0]);

    } catch (error) {
        return response.sendStatus(400)
    }
}

const updateTrade = async (request, response) => {
    const { id } = request.params;

    try {
        const { portId, symbol, quantity, price, type, date } = request.body;

        const result = await pool.query(
            'UPDATE trades SET portId = $1, symbol = $2, quantity = $3, price = $4, type = $5, date = $6 WHERE id = $7 RETURNING *',
            [portId, symbol, quantity, price, type, date, id]
        );

        if (result.rows.length === 0) {
            return response.status(404).json({ message: 'Trade not found' });
        }

        response.status(200).json(result.rows[0]);
    } catch (error) {
        return response.status(400).json({ message: "Error updating trade", error: error.message });
    }
};



const deleteTrade = async (request, response) => {
    const { id } = request.params
    try {
        const result = await pool.query(
            'DELETE FROM trades WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return response.status(404).json({ message: 'Trade not found' });
        }

        response.status(200).json({ message: 'Trade deleted successfully', trade: result.rows[0] });
    } catch (error) {
        return response.sendStatus(400);
    }
}

export { getTrades, getTrade, createTrade, updateTrade, deleteTrade }