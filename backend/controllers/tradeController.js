const Trade = require('./models/Trade.js')


const createTrade = async (req, res) => {
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