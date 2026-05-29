import { Router } from "express";
import { getAllScholarships, getScholarshipByIdHandler } from "../controllers/scholarship.controller";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.get("/", getAllScholarships);
router.get("/:id", validate(idParamSchema, "params"), getScholarshipByIdHandler);

export default router;
