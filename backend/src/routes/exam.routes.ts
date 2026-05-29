import { Router } from "express";
import { getAllExams, getExamByIdHandler } from "../controllers/exam.controller";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.get("/", getAllExams);
router.get("/:id", validate(idParamSchema, "params"), getExamByIdHandler);

export default router;
