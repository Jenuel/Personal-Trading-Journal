import { request } from 'express'
import Portfolio from '../models/Portfolio.js'

const getPortfolios = async (request, response) => {
    const portfolios = await Portfolio.find({}).sort({createdAt: -1})
    response.status(200).send(portfolios)
}

const getPortfolio = async (request, response) => {
    const { id } = request.params
    const portfolio = await Portfolio.findById(id)
    if (!portfolio){
        res.status(404).json({error: 'No such trade'})
    }
    response.status(200).send(portfolio)
}

const createPortfolio = async (request, response) => {
    console.log(request.body);

    const { portName, balance } = request.body;

    if (!portName || typeof balance !== 'number') {
        return response.status(400).json({ error: 'Invalid input data' });
    }

    try {
        const newPortfolio = new Portfolio({ portName, balance });
        const savedPortfolio = await newPortfolio.save();
        response.status(201).json(savedPortfolio);
        console.log(portName, balance)
    } catch (error) {
        console.error('Error creating portfolio:', error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateBalance = async (request, response) => {
    const { _id, incrementValue } = request.body

    try {
        const updatedPortfolio = await Portfolio.findByIdAndUpdate(
            _id,
            { $inc: { balance: incrementValue } },
            { new: true } 
        );

        if (!updatedPortfolio) {
            return response.status(404).json({ error: 'No such portfolio' });
        }

        response.status(200).send(updatedPortfolio);
    } catch (error) {
        response.status(500).json({ error: 'An error occurred' });
    }
}

const rebateBalance = async (request, response) => {
    const { _id } = request.params
    const { decrementValue } = request.body

    try {
        const updatedTrade = await Trade.findByIdAndUpdate(
            _id,
            { $inc: { balance: -decrementValue } }, 
            { new: true } 
          );

        if (!updatedPortfolio) {
            return response.status(404).json({ error: 'No such portfolio' });
        }

        response.status(200).send(updatedPortfolio);
    } catch (error) {
        response.status(500).json({ error: 'An error occurred' });
    }
}

const deletePortfolio = async (request, response) => {
    const { id } = request.params
    try {
        const result = await Portfolio.findOneAndDelete({ _id: id });
        if (result) {
            return response.sendStatus(204);  
        } else {
            return response.sendStatus(404);  
        }
    } catch (error) {
        return response.sendStatus(400);
    }
}

export { getPortfolios, getPortfolio, createPortfolio, updateBalance, rebateBalance, deletePortfolio }