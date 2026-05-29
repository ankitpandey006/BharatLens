import { Router } from "express";
import { getAllSchemes, getSchemeByIdHandler } from "../controllers/scheme.controller";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.get("/", getAllSchemes);
router.get("/:id", validate(idParamSchema, "params"), getSchemeByIdHandler);

export default router;
