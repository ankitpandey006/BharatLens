import { Router } from "express";
import { getAllJobs, getJobByIdHandler } from "../controllers/job.controller";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.get("/", getAllJobs);
router.get("/:id", validate(idParamSchema, "params"), getJobByIdHandler);

export default router;
