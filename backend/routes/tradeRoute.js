import express from 'express'
import { getTrades, getTrade, createTrade, updateTrade, deleteTrade } from '../controllers/tradeController.js'

const router = express.Router()

//get all trades based on the given port id
router.get('/trades/port/:id', getTrades)

//get a specific trade
router.get('/trades/:id', getTrade)

//create a trade
router.post('/trades', createTrade)

//update a trade
router.put('/trades/:id', updateTrade)

//delete a trade
router.delete('/trades/:id', deleteTrade)


export default router;