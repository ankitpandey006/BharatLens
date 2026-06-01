import { Router } from "express";
import { registerHandler, loginHandler, getUserProfileHandler } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema, userIdParamSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema, "body"), registerHandler);
router.post("/login", validate(loginSchema, "body"), loginHandler);
router.get("/:id", validate(userIdParamSchema, "params"), getUserProfileHandler);

export default router;
