import { Router } from "express";
import { eligibilityHandler } from "../controllers/eligibility.controller";
import { validate } from "../middlewares/validate.middleware";
import { eligibilitySchema } from "../validators/eligibility.validator";

const router = Router();

router.post("/", validate(eligibilitySchema, "body"), eligibilityHandler);

export default router;
