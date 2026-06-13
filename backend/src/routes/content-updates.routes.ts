/**
 * Content Updates Routes
 * Public: /api/updates
 * Admin: /api/admin/updates/* (behind auth)
 */

import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdminOrModerator } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { publicUpdatesQuerySchema, adminPublishUpdateSchema, adminUpdateActionSchema } from "../validators/content-updates.validator";
import { getPublicUpdatesHandler, publishUpdateHandler, updateUpdateStatusHandler, getAdminUpdatesHandler } from "../controllers/content-updates.controller";

const router = Router();

// ── Public API ──
router.get("/", validate(publicUpdatesQuerySchema, "query"), getPublicUpdatesHandler);

// ── Admin API (behind auth) ──
router.post("/", requireAuth, requireAdminOrModerator, validate(adminPublishUpdateSchema, "body"), publishUpdateHandler);
router.patch("/:id/status", requireAuth, requireAdminOrModerator, validate(adminUpdateActionSchema, "body"), updateUpdateStatusHandler);
router.get("/admin/all", requireAuth, requireAdminOrModerator, getAdminUpdatesHandler);

export default router;
