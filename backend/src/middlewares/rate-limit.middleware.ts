import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/**
 * General API rate limit: 100 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again.",
    error: "Rate limit exceeded. Please wait before making more requests.",
  },
});

/**
 * Strict rate limit for auth endpoints: 10 requests per minute per IP
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please wait a moment before trying again.",
    error: "Rate limit exceeded. Please wait before making more auth requests.",
  },
});

/**
 * Chat/AI rate limit: 5 requests per minute per IP
 * Protects Gemini free-tier quota from abuse.
 * Since the frontend chatbot makes one request at a time,
 * 5 req/min is generous for normal use but prevents quota drain.
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many chat requests. Please wait a moment before trying again.",
    error: "Please wait before sending more messages. The system protects AI quota by limiting request rate.",
  },
});

/**
 * Admin rate limit:
 * - Development: 300 requests/min (accounts for StrictMode double-fetch)
 * - Production: 100 requests/min
 * Admin pages make several parallel calls (sidebar stats, page data, auth check),
 * so the limit needs to accommodate normal page navigation.
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === "production" ? 100 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many admin requests. Please wait a moment before refreshing.",
    error: "Please wait before making more admin requests. The system has detected too many simultaneous calls.",
  },
});
