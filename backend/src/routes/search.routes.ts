import { Router } from "express";
import { searchHandler } from "../controllers/search.controller";
import { validate } from "../middlewares/validate.middleware";
import { searchQuerySchema } from "../validators/search.validator";

const router = Router();

router.get("/", validate(searchQuerySchema, "query"), searchHandler);

export default router;
