import { Router } from "express";
import { recommendationHandler } from "../controllers/recommendation.controller";
import { validate } from "../middlewares/validate.middleware";
import { recommendationSchema } from "../validators/recommendation.validator";

const router = Router();

router.post("/", validate(recommendationSchema, "body"), recommendationHandler);

export default router;
