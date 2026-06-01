import { Router } from "express";
import { testDbHandler } from "../controllers/test.controller";

const router = Router();

router.get("/", testDbHandler);

export default router;
