import tradeRoutes from "./tradeRoute";
import portRoutes from "./portRoute";

import { Router } from "express";

const router = Router()

router.use("/trade", tradeRoutes);
router.use("/port", portRoutes);

export default router;