import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  generateRecommendationsHandler,
  listRecommendationsHandler,
  getRecommendationsByTypeHandler,
  markRecommendationViewedHandler,
} from "../controllers/recommendation.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  recommendationIdSchema,
  recommendationQuerySchema,
  recommendationItemTypeSchema,
} from "../validators/recommendation.validator";

const router = Router();

router.use(requireAuth);
router.get("/", validate(recommendationQuerySchema, "query"), listRecommendationsHandler);
router.post("/generate", generateRecommendationsHandler);
router.get(
  "/:itemType",
  validate(recommendationItemTypeSchema, "params"),
  validate(recommendationQuerySchema, "query"),
  getRecommendationsByTypeHandler,
);
router.patch("/:id/viewed", validate(recommendationIdSchema, "params"), markRecommendationViewedHandler);

export default router;
