import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdminOrModerator } from "../middlewares/role.middleware";
import { processCollectedDataHandler } from "../controllers/pipeline.controller";

const router = Router();

router.use(requireAuth, requireAdminOrModerator);

// POST /api/ai/process-collected-data
router.post("/process-collected-data", processCollectedDataHandler);

export default router;
