import Trade from './models/Trade.js'

const getTrades = async (req, res) => {
    const trades = await Trade.find({}).sort({createdAt: -1})
    res.status(200).json(trades)
}

const getTrade = async (req, res) => {
    const { id } = req.params
    const trade = await Trade.findById(id)
    if (!trade){
        res.status(404).json({error: 'No such trade'})
    }
    res.status(200).json(trade)
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
    const {
        currencyPair,
        entryPrice,
        closingPrice,
        entryTime,
        closingTime,
        units,
        description
    } = req.body

    try {
        const trade = await Trade.create({
            currencyPair,
            entryPrice,
            closingPrice,
            entryTime,
            closingTime,
            units,
            description
        })
        res.status(200).json(trade)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const updateTrade = async (req, res ) => {

}

const deleteTrade = async (req, res ) => {
    
}
export { getTrades, getTrade, createTrade, updateTrade, deleteTrade }