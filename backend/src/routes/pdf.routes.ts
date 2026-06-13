import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdminOrModerator } from "../middlewares/role.middleware";
import extractPdfHandler from "../controllers/pdf.controller";

const router = Router();

router.use(requireAuth, requireAdminOrModerator);
router.post("/extract", extractPdfHandler);

export default router;
