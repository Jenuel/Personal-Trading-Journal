import express from 'express'
import { createTrade } from '../controllers/tradeController'

const router = express.Router()

router.get('/', (request, response) => {
    
})

router.post('/', createTrade)

router.delete('/', (req, res) => {
    
})

router.put('/', )

router.patch('/', (req, res) => {
    
})

export default router;