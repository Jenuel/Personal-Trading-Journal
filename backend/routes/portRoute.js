import express from 'express'
import { getPortfolios, getPortfolio, updateBalance, createPortfolio, rebateBalance, deletePortfolio } from '../controllers/portController.js'
const router = express.Router()

router.get('/ports', getPortfolios)

router.get('/ports/:id', getPortfolio)

router.post('/ports', createPortfolio)

router.patch('/ports', updateBalance)

router.patch('/ports/:id', rebateBalance)

router.delete('/ports', deletePortfolio)


export default router;