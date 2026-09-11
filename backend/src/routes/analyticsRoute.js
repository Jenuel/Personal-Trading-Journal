import express from 'express'
import { AnalyticsController } from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/analytics', AnalyticsController.getSummaries)

// Three segments, so /portfolios/:id cannot swallow this the way /trades/:id
// would swallow /trades/port/:id.
router.get('/portfolios/:id/analytics', AnalyticsController.getAnalytics)

export default router;
