import tradeRoutes from "./tradeRoute.js";
import portRoutes from "./portRoute.js";
import analyticsRoutes from "./analyticsRoute.js";

import { Router } from "express";

const router = Router()

router.use(analyticsRoutes);
router.use(portRoutes);
router.use(tradeRoutes);

export default router;
