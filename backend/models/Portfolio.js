moongose = require('moongose')

const Schema = moongose.Schema

const newPortfolio = new Schema({
    balance: {
        type: Number,
        required: true
    }
})

const Portflio = moongose.model('Portfolio', newPortfolio)

module.exports = {
    Portflio
}