import pool from '../db.js'

const getPortfolios = async (request, response) => {

    try {
        const results = await pool.query('SELECT * FROM portfolios');

        if (results.rows.length === 0) {
            return response.status(404).json({ message: 'No portfolios found' });
        }

        return response.status(200).json(results.rows);
    } catch (error) {
        return response.status(500).json({ message: 'Error fetching portfolios', error: error.message})
    }
}

const getPortfolio = async (request, response) => {
    const { id } = request.params
    try {
        const results = await pool.query('SELECT * FROM portfolios WHERE id = $1', [id]);
        if (results.rows.length === 0) {
            return response.status(404).json({ message: 'Portfolio not found' });
        }
        return response.status(200).json(results.rows[0]);
    } catch (error) {
        console.error('Error fetching portfolio:', error.message);
        return response.status(500).json({ message: 'Error fetching portfolio', error: error.message });
    }
}

const createPortfolio = async (request, response) => {
    const { portName, balance } = request.body;

    if (!portName || typeof balance !== 'number') {
        return response.status(400).json({ error: 'Invalid input data' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO portfolios (portName, balance) VALUES ($1, $2) RETURNING *',
            [portName, balance]
        );
        
        if (result.rows.length === 0) {
            return response.status(500).json({ error: 'Failed to create portfolio' });
        }

        return response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating portfolio:', error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateBalance = async (request, response) => {
    const { id, incrementValue } = request.body;

    try {
        const results = await pool.query(
            'UPDATE Portfolio SET balance = balance + $1 WHERE id = $2 RETURNING *',
            [incrementValue, id]
        );

        if (results.rows.length === 0) { 
            return response.status(404).json({ error: 'No such portfolio' });
        }

        return response.status(200).json(results.rows[0]);
    } catch (error) {
        console.error('Error updating balance:', error);
        response.status(500).json({ error: 'An error occurred' });
    }
};

const rebateBalance = async (request, response) => {
    const { id } = request.params
    const { decrementValue } = request.body

    try {
        const results = await pool.query(
            'UPDATE portfolios SET balance = balance - $1 WHERE id = $2 RETURNING *',
            [decrementValue, id]
        );

        if (results.rows.length === 0) {
            return response.status(404).json({ error: 'No such portfolio' });
        }

        return response.status(200).json(results.rows[0]);
    } catch (error) {
        response.status(500).json({ error: 'An error occurred' });
    }
}

const deletePortfolio = async (request, response) => {
    const { id } = request.params
    
    try {
       const results = await pool.query(
            'DELETE FROM portfolios WHERE id = $1 RETURNING *',
            [id]
       );

       if (results.rows.length === 0) {
            return response.status(404).json({ error: 'Portfolio not found' });
       }

       return response.status(200).json({ message: 'Portfolio deleted successfully' });
    } catch (error) {
        return response.sendStatus(400);
    }
}

export { getPortfolios, getPortfolio, createPortfolio, updateBalance, rebateBalance, deletePortfolio }