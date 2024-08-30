import express from 'express'
import { getPortfolios, getPortfolio, createPortfolio, deletePortfolio } from '../controllers/portController'
const router = express.Router()

router.get('/ports', getPortfolios)

router.get('/ports/:id', getPortfolio)

router.post('/ports/:id', createPortfolio)

router.delete('/ports', deletePortfolio)


export default router;