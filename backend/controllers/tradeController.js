import { request } from 'express'
import Trade from '../models/Trade.js'

const getTrades = async (request, response) => {
    const trades = await Trade.find({}).sort({createdAt: -1})
    response.status(200).send(trades)
}

const getTrade = async (request, response) => {
    const { id } = request.params
    const trade = await Trade.findById(id)
    if (!trade){
        res.status(404).json({error: 'No such trade'})
    }
    response.status(200).send(trade)
}

const createTrade = async (request, response) => {
    const { body } = request
    const newTrade = new Trade(body)
    try {
        const savedTrade = await newTrade.save();
        return response.status(201).send(savedTrade)
    } catch (error) {
        return response.sendStatus(400)
    }
}

const updateTrade = async (request, response) => {
    const { id } = request.params
    const updatedTrade = request.body
    try {
        const result = await Trade.findOneAndUpdate({ _id: id }, updatedTrade, { new: true });
        if (result) {
            return response.status(200).send(result);
        } else {
            return response.sendStatus(404);  // Trade not found
        }
    } catch (error) {
        return response.sendStatus(400);
    }
}


const deleteTrade = async (request, response) => {
    const { id } = request.params
    try {
        const result = await Trade.findOneAndDelete({ _id: id });
        if (result) {
            return response.sendStatus(204);  
        } else {
            return response.sendStatus(404);  
        }
    } catch (error) {
        return response.sendStatus(400);
    }
}

export { getTrades, getTrade, createTrade, updateTrade, deleteTrade }