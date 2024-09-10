import express from 'express'
import { getPortfolios, getPortfolio, createPortfolio, deletePortfolio } from '../controllers/portController.js'
const router = express.Router()

router.get('/ports', getPortfolios)

router.get('/ports/:id', getPortfolio)

router.post('/ports', createPortfolio)

router.delete('/ports', deletePortfolio)


export default router;