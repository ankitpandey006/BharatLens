import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  createOwnProfileHandler,
  getOwnProfileHandler,
  updateOwnProfileHandler,
  getProfileHandler,
} from "../controllers/profile.controller";
import { validate } from "../middlewares/validate.middleware";
import { profileCreateSchema, profileIdParamSchema, profileUpdateSchema } from "../validators/profile.validator";

const router = Router();

router.get("/me", requireAuth, getOwnProfileHandler);
router.patch("/me", requireAuth, validate(profileUpdateSchema, "body"), updateOwnProfileHandler);
router.get("/", requireAuth, getOwnProfileHandler);
router.post("/", requireAuth, validate(profileCreateSchema, "body"), createOwnProfileHandler);
router.put("/", requireAuth, validate(profileUpdateSchema, "body"), updateOwnProfileHandler);
router.patch("/", requireAuth, validate(profileUpdateSchema, "body"), updateOwnProfileHandler);
router.get("/:id", validate(profileIdParamSchema, "params"), getProfileHandler);

export default router;
