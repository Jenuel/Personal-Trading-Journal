import mongoose from 'mongoose';
import Portfolio from './Portfolio.js';

const Schema = mongoose.Schema;

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
}, { timestamps: true });

tradeSchema.post('save', async function(doc, next) {
    doc.return = (doc.closingPrice - doc.entryPrice) * doc.units;
    doc.status = doc.return > 0 ? 'WIN' : doc.return < 0 ? 'LOSS' : 'BREAKEVEN';

    try {
        const portfolio = await Portfolio.findById(doc.balance);
        if (portfolio) {
            portfolio.balance += doc.return;
            await portfolio.save();
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Trade = mongoose.model('Trade', tradeSchema);

export default Trade;
