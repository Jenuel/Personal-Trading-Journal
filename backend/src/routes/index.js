import tradeRoutes from "./tradeRoute.js";
import portRoutes from "./portRoute.js";

import { Router } from "express";

const router = Router()

router.use("/trade", tradeRoutes);
router.use("/port", portRoutes);

export default router;