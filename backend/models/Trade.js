import mongoose from 'mongoose';
import Portfolio from './Portfolio.js';

const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    category: {
        type: String,
        required: true
    },
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
        type: String,
        required: true
    },
    closingTime: {
        type: String,
        required: true
    },
    units: {
        type: Number,
        required: true
    },
    profit: {
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
    portId: {
        type: Schema.Types.ObjectId,
        ref: 'Portfolio'
    }
}, { timestamps: true });


const Trade = mongoose.model('Trade', tradeSchema);

export default Trade;
