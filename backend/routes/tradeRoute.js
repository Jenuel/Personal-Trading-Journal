import express from 'express'
import { getTrades, getTrade, createTrade, updateTrade, deleteTrade } from '../controllers/tradeController.js'

const router = express.Router()

//get all trades
router.get('/trades', getTrades)

//get a specific trade
router.get('/trades/:id', getTrade)

//create a trade
router.post('/trades/:id', createTrade)

//update a trade
router.put('/trades/:id', updateTrade)

//delete a trade
router.delete('/trades/:id', deleteTrade)


export default router;