import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  generateRecommendationsHandler,
  listRecommendationsHandler,
  markRecommendationViewedHandler,
} from "../controllers/recommendation.controller";
import { validate } from "../middlewares/validate.middleware";
import { recommendationIdSchema, recommendationQuerySchema } from "../validators/recommendation.validator";

const router = Router();

router.use(requireAuth);
router.get("/", validate(recommendationQuerySchema, "query"), listRecommendationsHandler);
router.post("/generate", generateRecommendationsHandler);
router.patch("/:id/viewed", validate(recommendationIdSchema, "params"), markRecommendationViewedHandler);

export default router;
