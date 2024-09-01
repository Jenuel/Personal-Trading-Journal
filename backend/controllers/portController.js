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
    const { body } = request
    const newPortfolio = new Portfolio(body)
    try {
        const savedPortfolio = await newPortfolio.save();
        return response.status(201).send(savedPortfolio)
    } catch (error) {
        return response.sendStatus(400)
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

export { getPortfolios, getPortfolio, createPortfolio, deletePortfolio }