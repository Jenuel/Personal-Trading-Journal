import express from 'express'
import { TradeController } from '../controllers/tradeController.js'

const router = express.Router()

router.get('/trades/port/:id', TradeController.getTrades)

router.get('/trades/:id', TradeController.getTrade)

router.post('/trades', TradeController.createTrade)

router.put('/trades/:id', TradeController.updateTrade)

router.delete('/trades/:id', TradeController.deleteTrade)


export default router;