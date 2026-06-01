import { Router } from "express";
import { getProfileHandler, updateProfileHandler } from "../controllers/profile.controller";
import { validate } from "../middlewares/validate.middleware";
import { profileIdParamSchema, profileUpdateSchema } from "../validators/profile.validator";

const router = Router();

router.get("/:id", validate(profileIdParamSchema, "params"), getProfileHandler);
router.put("/:id", validate(profileIdParamSchema, "params"), validate(profileUpdateSchema, "body"), updateProfileHandler);

export default router;
