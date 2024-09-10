import mongoose from 'mongoose'

const Schema = mongoose.Schema

    const newPortfolioSchema = new Schema({
        portName: {
            type: String,
            required: true
        },
        balance: {
            type: Number,
            required: true
        }
    }, { timestamps: true})

const Portfolio = mongoose.model('portfolios', newPortfolioSchema)

export default Portfolio;
