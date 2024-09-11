import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const newPortfolioSchema = new Schema({
    portName: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
}, { timestamps: true });

newPortfolioSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.__v;
        delete ret.updatedAt;
        return ret;
    }
});

const Portfolio = mongoose.model('Portfolio', newPortfolioSchema);

export default Portfolio;
