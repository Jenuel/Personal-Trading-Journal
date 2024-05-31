import express from 'express'
import { getTrades, getTrade, createTrade, updateTrade, deleteTrade } from '../controllers/tradeController'

const router = express.Router()

//get all trades
router.get('/', getTrades)

router.get('/', getTrade)

//create a trade
router.post('/', createTrade)

//update a trade
router.put('/', updateTrade)

//delete a trade
router.delete('/', deleteTrade)


export default router;