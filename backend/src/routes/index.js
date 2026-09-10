import tradeRoutes from "./tradeRoute.js";
import portRoutes from "./portRoute.js";

import { Router } from "express";

const router = Router()

router.use(portRoutes);
router.use(tradeRoutes);

export default router;
