const express = require('express')
const {
    createTrade
} = require('../controllers/tradeController')
const router = express.Router()

router.get('/', (req, res) => {
    
})

router.post('/', createTrade)

router.delete('/', (req, res) => {
    
})

router.patch('/', (req, res) => {
    
})

module.exports = router