/**
 * AI Chat Routes
 *
 * Phase 4: Chatbot endpoint for user questions.
 * POST /api/ai/chat
 *
 * Protected route — requires auth.
 * Rate limited per user to avoid Gemini quota abuse.
 */

import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { chatLimiter } from "../middlewares/rate-limit.middleware";
import { chatHandler } from "../controllers/chat.controller";

const router = Router();

// All chat routes require auth + rate limit to protect Gemini quota
router.use(requireAuth);
router.use(chatLimiter);

router.post("/chat", chatHandler);

export default router;
