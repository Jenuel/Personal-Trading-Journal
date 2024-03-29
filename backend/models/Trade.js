const mongoose = require('moongose')
const Portflio = require('./Portfolio')

const Schema = mongoose.Schema

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
    description: {
        type: String,
        required: true
    },
    balance: {
        type: Schema.Types.ObjectId,
        ref: 'Portfolio'
    }
}, { timestamps: true })

tradeSchema.post('save', async (next) => {
    this.return = (this.closingPrice - this.entryPrice) * this.units;

    this.status = this.return > 0 ? 'WIN' : this.return < 0 ? 'LOSS' : 'BREAKEVEN';

    this.balance = this.balance + this.return;

    const balance = await Portflio.findOneAndUpdate(
        { _id: this.balance },
        { $inc: { balance: returnAmount } }, 
        { new: true } 
    );

    next();
});


module.exports = moongose.model('Trade', tradeSchema)