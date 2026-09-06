import express from 'express'
import { PortfolioController } from '../controllers/portController.js'

const router = express.Router()

router.get('/portfolios', PortfolioController.getPortfolios)

router.get('/portfolios/:id', PortfolioController.getPortfolio)

router.post('/portfolios', PortfolioController.createPortfolio)

router.put('/portfolios/:id', PortfolioController.updatePortfolio)

router.delete('/portfolios/:id', PortfolioController.deletePortfolio)

export default router;
