moongose = require('moongose')

const Schema = moongose.Schema

const newPortfolio = new Schema({
    portName: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const Portflio = moongose.model('Portfolio', newPortfolio)

module.exports = {
    Portflio
}