import express from 'express'
import { PortfolioController } from '../controllers/portController.js'

const router = express.Router()

router.get('/ports', PortfolioController.getPortfolios)

router.get('/ports/:id', PortfolioController.getPortfolio)

router.post('/ports', PortfolioController.createPortfolio)

router.patch('/ports', PortfolioController.updateBalance)

router.patch('/ports/:id', PortfolioController.rebateBalance)

router.delete('/ports/:id', PortfolioController.deletePortfolio)

export default router;