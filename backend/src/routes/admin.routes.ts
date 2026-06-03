import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdminOrModerator } from "../middlewares/role.middleware";
import { injectItemType } from "../middlewares/inject-item-type.middleware";
import {
  approveAdminItemHandler,
  deleteAdminItemHandler,
  expireAdminItemHandler,
  getAdminSourcesHandler,
  getAdminItemHandler,
  getAdminItemsHandler,
  getAdminUpdatesHandler,
  getAdminStatsHandler,
  getAdminUsersHandler,
  getApprovedAdminItemsHandler,
  getPendingAdminItemsHandler,
  getPublishedAdminItemsHandler,
  getRejectedAdminItemsHandler,
  publishAdminItemHandler,
  rejectAdminItemHandler,
  unpublishAdminItemHandler,
  updateAdminItemHandler,
  verifyAdminSourceHandler,
  updateUserRoleHandler,
} from "../controllers/admin.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  adminItemParamSchema,
  adminReviewBodySchema,
  adminSourceParamSchema,
  adminStatusQuerySchema,
  adminUpdateBodySchema,
  adminUserRoleSchema,
  adminUserParamSchema,
} from "../validators/admin.validator";

const router = Router();

router.use(requireAuth, requireAdminOrModerator);

router.get("/stats", getAdminStatsHandler);
router.get("/users", getAdminUsersHandler);
router.patch("/users/:userId/role", validate(adminUserParamSchema, "params"), validate(adminUserRoleSchema, "body"), updateUserRoleHandler);
router.get("/sources", getAdminSourcesHandler);
router.patch("/sources/:id/verify", validate(adminSourceParamSchema, "params"), verifyAdminSourceHandler);
router.get("/updates", getAdminUpdatesHandler);
router.get("/pending", validate(adminStatusQuerySchema, "query"), getPendingAdminItemsHandler);
router.get("/approved", validate(adminStatusQuerySchema, "query"), getApprovedAdminItemsHandler);
router.get("/rejected", validate(adminStatusQuerySchema, "query"), getRejectedAdminItemsHandler);
router.get("/published", validate(adminStatusQuerySchema, "query"), getPublishedAdminItemsHandler);
router.get("/items/:status", validate(adminStatusQuerySchema, "query"), getAdminItemsHandler);
router.get("/items/:itemType/:itemId", validate(adminItemParamSchema, "params"), getAdminItemHandler);
router.patch(
  "/items/:itemType/:itemId/approve",
  validate(adminItemParamSchema, "params"),
  approveAdminItemHandler,
);
router.patch(
  "/items/:itemType/:itemId/reject",
  validate(adminItemParamSchema, "params"),
  validate(adminReviewBodySchema, "body"),
  rejectAdminItemHandler,
);
router.patch(
  "/items/:itemType/:itemId/publish",
  validate(adminItemParamSchema, "params"),
  publishAdminItemHandler,
);
router.patch(
  "/items/:itemType/:itemId/unpublish",
  validate(adminItemParamSchema, "params"),
  unpublishAdminItemHandler,
);
router.patch(
  "/items/:itemType/:itemId/expire",
  validate(adminItemParamSchema, "params"),
  expireAdminItemHandler,
);
router.patch(
  "/items/:itemType/:itemId",
  validate(adminItemParamSchema, "params"),
  validate(adminUpdateBodySchema, "body"),
  updateAdminItemHandler,
);
router.delete("/items/:itemType/:itemId", validate(adminItemParamSchema, "params"), deleteAdminItemHandler);

router.get("/:itemType/:id", validate(adminItemParamSchema, "params"), getAdminItemHandler);
router.patch("/:itemType/:id/approve", validate(adminItemParamSchema, "params"), approveAdminItemHandler);
router.patch(
  "/:itemType/:id/reject",
  validate(adminItemParamSchema, "params"),
  validate(adminReviewBodySchema, "body"),
  rejectAdminItemHandler,
);
router.patch("/:itemType/:id/publish", validate(adminItemParamSchema, "params"), publishAdminItemHandler);
router.patch("/:itemType/:id/unpublish", validate(adminItemParamSchema, "params"), unpublishAdminItemHandler);
router.patch("/:itemType/:id", validate(adminItemParamSchema, "params"), validate(adminUpdateBodySchema, "body"), updateAdminItemHandler);
router.delete("/:itemType/:id", validate(adminItemParamSchema, "params"), deleteAdminItemHandler);

// Plural routes for schemes, scholarships, jobs, exams
router.get("/schemes/:id", injectItemType(), validate(adminItemParamSchema, "params"), getAdminItemHandler);
router.patch("/schemes/:id/approve", injectItemType(), validate(adminItemParamSchema, "params"), approveAdminItemHandler);
router.patch(
  "/schemes/:id/reject",
  injectItemType(),
  validate(adminItemParamSchema, "params"),
  validate(adminReviewBodySchema, "body"),
  rejectAdminItemHandler,
);
router.patch("/schemes/:id/publish", injectItemType(), validate(adminItemParamSchema, "params"), publishAdminItemHandler);
router.patch("/schemes/:id/unpublish", injectItemType(), validate(adminItemParamSchema, "params"), unpublishAdminItemHandler);
router.patch("/schemes/:id", injectItemType(), validate(adminItemParamSchema, "params"), validate(adminUpdateBodySchema, "body"), updateAdminItemHandler);
router.delete("/schemes/:id", injectItemType(), validate(adminItemParamSchema, "params"), deleteAdminItemHandler);

router.get("/scholarships/:id", injectItemType(), validate(adminItemParamSchema, "params"), getAdminItemHandler);
router.patch("/scholarships/:id/approve", injectItemType(), validate(adminItemParamSchema, "params"), approveAdminItemHandler);
router.patch(
  "/scholarships/:id/reject",
  injectItemType(),
  validate(adminItemParamSchema, "params"),
  validate(adminReviewBodySchema, "body"),
  rejectAdminItemHandler,
);
router.patch("/scholarships/:id/publish", injectItemType(), validate(adminItemParamSchema, "params"), publishAdminItemHandler);
router.patch("/scholarships/:id/unpublish", injectItemType(), validate(adminItemParamSchema, "params"), unpublishAdminItemHandler);
router.patch("/scholarships/:id", injectItemType(), validate(adminItemParamSchema, "params"), validate(adminUpdateBodySchema, "body"), updateAdminItemHandler);
router.delete("/scholarships/:id", injectItemType(), validate(adminItemParamSchema, "params"), deleteAdminItemHandler);

router.get("/jobs/:id", injectItemType(), validate(adminItemParamSchema, "params"), getAdminItemHandler);
router.patch("/jobs/:id/approve", injectItemType(), validate(adminItemParamSchema, "params"), approveAdminItemHandler);
router.patch(
  "/jobs/:id/reject",
  injectItemType(),
  validate(adminItemParamSchema, "params"),
  validate(adminReviewBodySchema, "body"),
  rejectAdminItemHandler,
);
router.patch("/jobs/:id/publish", injectItemType(), validate(adminItemParamSchema, "params"), publishAdminItemHandler);
router.patch("/jobs/:id/unpublish", injectItemType(), validate(adminItemParamSchema, "params"), unpublishAdminItemHandler);
router.patch("/jobs/:id", injectItemType(), validate(adminItemParamSchema, "params"), validate(adminUpdateBodySchema, "body"), updateAdminItemHandler);
router.delete("/jobs/:id", injectItemType(), validate(adminItemParamSchema, "params"), deleteAdminItemHandler);

router.get("/exams/:id", injectItemType(), validate(adminItemParamSchema, "params"), getAdminItemHandler);
router.patch("/exams/:id/approve", injectItemType(), validate(adminItemParamSchema, "params"), approveAdminItemHandler);
router.patch(
  "/exams/:id/reject",
  injectItemType(),
  validate(adminItemParamSchema, "params"),
  validate(adminReviewBodySchema, "body"),
  rejectAdminItemHandler,
);
router.patch("/exams/:id/publish", injectItemType(), validate(adminItemParamSchema, "params"), publishAdminItemHandler);
router.patch("/exams/:id/unpublish", injectItemType(), validate(adminItemParamSchema, "params"), unpublishAdminItemHandler);
router.patch("/exams/:id", injectItemType(), validate(adminItemParamSchema, "params"), validate(adminUpdateBodySchema, "body"), updateAdminItemHandler);
router.delete("/exams/:id", injectItemType(), validate(adminItemParamSchema, "params"), deleteAdminItemHandler);

export default router;
