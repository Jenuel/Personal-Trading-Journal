import mongoose from 'mongose'

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
})

const Portfolio = mongoose.model('Portfolio', newPortfolioSchema)

export default Portfolio;
