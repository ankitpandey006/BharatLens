import { Router } from "express";
import {
  approveAdminContentHandler,
  getPendingAdminContentHandler,
  rejectAdminContentHandler,
} from "../controllers/admin.controller";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.get("/pending", getPendingAdminContentHandler);
router.post("/:id/approve", validate(idParamSchema, "params"), approveAdminContentHandler);
router.post("/:id/reject", validate(idParamSchema, "params"), rejectAdminContentHandler);

export default router;
