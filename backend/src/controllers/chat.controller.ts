/**
 * Chat Controller
 *
 * Phase 4: Handles AI chat requests.
 * POST /api/ai/chat
 *
 * Uses authenticated user profile for personalized recommendations
 * when available. Falls back to generic mode for unauthenticated users.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { processChatMessage } from "../services/chat.service";

/**
 * POST /api/ai/chat
 * Process a user message and return AI response.
 * If user is authenticated, their profile data is passed
 * for personalized recommendations.
 */
export const chatHandler = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return sendError(res, "Message is required", 400);
  }

  if (message.length > 1500) {
    return sendError(res, "Message too long (max 1500 characters)", 400);
  }

  // Pass user profile if authenticated (req.user set by requireAuth middleware)
  const result = await processChatMessage(message, req.user);

  sendSuccess(res, "Chat response generated", {
    reply: result.reply,
    fallbackUsed: result.fallbackUsed,
  });
});
