import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  updateAuthProfileHandler,
  getUserProfileHandler,
} from "../controllers/auth.controller";
import { loginSchema, registerSchema, authProfileUpdateSchema, userIdParamSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema, "body"), registerHandler);
router.post("/login", validate(loginSchema, "body"), loginHandler);
router.post("/logout", requireAuth, logoutHandler);
router.get("/me", requireAuth, meHandler);
router.patch("/profile", requireAuth, validate(authProfileUpdateSchema, "body"), updateAuthProfileHandler);
router.get("/:id", validate(userIdParamSchema, "params"), getUserProfileHandler);

export default router;
