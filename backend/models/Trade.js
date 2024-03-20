const moongose = require('moongose')

const Schema = moongose.Schema

const tradeSchema = new Schema({
    currencyPair: {
        type: String, 
        required: true
    },
    entryPrice: {
        type: Number,
        required: true
    },
    closingPrice: {
        type: Number,
        required: true
    },
    entryTime: {
        type: Date,
        required: true
    },
    closingTime: {
        type: Date,
        required: true
    },
    units: {
        type: Number,
        required: true
    },
    return: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    OvrBalance: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

tradeSchema.pre('save', (next) => {
    this.return = (this.closingPrice - this.entryPrice) * this.units;

    this.status = this.return > 0 ? 'WIN' : this.return < 0 ? 'LOSS' : 'BREAKEVEN';

    next();
});


module.exports = moongose.model('Trade', tradeSchema)