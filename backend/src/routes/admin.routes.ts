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
  getAdminCollectedDataHandler,
  getAdminCollectedDataByIdHandler,
  approveCollectedDataHandler,
  rejectCollectedDataHandler,
  editCollectedDataHandler,
  publishCollectedDataHandler,
  unpublishCollectedDataHandler,
  deleteCollectedDataHandler,
  publishAdminItemHandler,
  rejectAdminItemHandler,
  unpublishAdminItemHandler,
  updateAdminItemHandler,
  verifyAdminSourceHandler,
  updateUserRoleHandler,
  bulkApproveHandler,
  bulkRejectHandler,
  bulkPublishHandler,
  bulkUnpublishHandler,
  bulkRestoreHandler,
  bulkDeleteHandler,
  bulkProcessAiHandler,
} from "../controllers/admin.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  adminItemParamSchema,
  adminQuerySchema,
  adminReviewBodySchema,
  adminNotesBodySchema,
  adminCollectedDataEditSchema,
  adminPublishBodySchema,
  adminSourceParamSchema,
  adminStatusQuerySchema,
  adminUpdateBodySchema,
  adminUserRoleSchema,
  adminUserParamSchema,
  adminBulkActionSchema,
  adminBulkAiProcessSchema,
} from "../validators/admin.validator";

const router = Router();

router.use(requireAuth, requireAdminOrModerator);

// ── Stats & Management ──
router.get("/stats", getAdminStatsHandler);
router.get("/users", getAdminUsersHandler);
router.patch("/users/:userId/role", validate(adminUserParamSchema, "params"), validate(adminUserRoleSchema, "body"), updateUserRoleHandler);
router.get("/sources", getAdminSourcesHandler);
router.patch("/sources/:id/verify", validate(adminSourceParamSchema, "params"), verifyAdminSourceHandler);
router.get("/updates", getAdminUpdatesHandler);

// ── Collected Data Pipeline ──
router.get("/collected-data", validate(adminQuerySchema, "query"), getAdminCollectedDataHandler);
router.get("/collected-data/:id", getAdminCollectedDataByIdHandler);
router.patch(
  "/collected-data/:id/approve",
  validate(adminNotesBodySchema, "body"),
  approveCollectedDataHandler,
);
router.patch(
  "/collected-data/:id/reject",
  validate(adminReviewBodySchema, "body"),
  rejectCollectedDataHandler,
);
router.patch("/collected-data/:id/edit", validate(adminCollectedDataEditSchema, "body"), editCollectedDataHandler);
router.patch(
  "/collected-data/:id/publish",
  validate(adminPublishBodySchema, "body"),
  publishCollectedDataHandler,
);
router.patch("/collected-data/:id/unpublish", unpublishCollectedDataHandler);
router.patch("/collected-data/:id/delete", deleteCollectedDataHandler);

// ── Bulk Actions ──
router.post(
  "/collected-data/bulk-approve",
  validate(adminBulkActionSchema, "body"),
  bulkApproveHandler,
);
router.post(
  "/collected-data/bulk-reject",
  validate(adminBulkActionSchema, "body"),
  bulkRejectHandler,
);
router.post(
  "/collected-data/bulk-publish",
  validate(adminBulkActionSchema, "body"),
  bulkPublishHandler,
);
router.post(
  "/collected-data/bulk-unpublish",
  validate(adminBulkActionSchema, "body"),
  bulkUnpublishHandler,
);
router.post(
  "/collected-data/bulk-restore",
  validate(adminBulkActionSchema, "body"),
  bulkRestoreHandler,
);
router.post(
  "/collected-data/bulk-delete",
  validate(adminBulkActionSchema, "body"),
  bulkDeleteHandler,
);
router.post(
  "/collected-data/bulk-process-ai",
  validate(adminBulkAiProcessSchema, "body"),
  bulkProcessAiHandler,
);

router.get("/verification", validate(adminQuerySchema, "query"), getAdminCollectedDataHandler);

// ── Status-based views (public table items grouped by status) ──
router.get("/pending", validate(adminStatusQuerySchema, "query"), getPendingAdminItemsHandler);
router.get("/approved", validate(adminStatusQuerySchema, "query"), getApprovedAdminItemsHandler);
router.get("/rejected", validate(adminStatusQuerySchema, "query"), getRejectedAdminItemsHandler);
router.get("/published", validate(adminStatusQuerySchema, "query"), getPublishedAdminItemsHandler);
router.get("/items/:status", validate(adminStatusQuerySchema, "query"), getAdminItemsHandler);

// ── Public table item CRUD (singular form: /items/:itemType/:itemId) ──
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

// ── Plural URL convention (legacy compat) ──
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
