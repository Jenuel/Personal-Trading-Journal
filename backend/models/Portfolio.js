moongose = require('moongose')

const Schema = moongose.Schema

const newPortfolio = new Schema({
    balance: {
        type: Number,
        required: true
    }
})

