/**
 * AI Processing Routes
 *
 * Admin-only endpoints for the AI processing pipeline.
 *
 * Endpoints:
 * - POST /api/ai-processing/process/:id     - Process a single item
 * - POST /api/ai-processing/process-pending - Process all pending items
 * - GET  /api/ai-processing/logs/:id         - Get processing logs for an item
 * - POST /api/verification/recheck/:id       - Re-check verification on an item
 */

import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdminOrModerator } from "../middlewares/role.middleware";
import {
  processSingleItemHandler,
  processPendingItemsHandler,
  getProcessingLogsHandler,
  recheckVerificationHandler,
} from "../controllers/ai-processing.controller";

const router = Router();

// All AI processing routes require auth + admin/moderator
router.use(requireAuth, requireAdminOrModerator);

router.post("/process/:id", processSingleItemHandler);
router.post("/process-pending", processPendingItemsHandler);
router.get("/logs/:id", getProcessingLogsHandler);

// Verification recheck (also admin-only)
router.post("/recheck/:id", recheckVerificationHandler);

export default router;
