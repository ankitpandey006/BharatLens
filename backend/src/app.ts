import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import {
  schemeRoutes,
  scholarshipRoutes,
  jobRoutes,
  examRoutes,
  adminRoutes,
  authRoutes,
  searchRoutes,
  eligibilityRoutes,
  recommendationRoutes,
  profileRoutes,
  notificationsRoutes,
  savedRoutes,
  collectorRoutes,
  pdfRoutes,
  docsRoutes,
  testRoutes,
  dashboardRoutes,
  aiProcessingRoutes,
  chatRoutes,
  pipelineRoutes,
  contentUpdatesRoutes,
} from "./routes";
import { requireAuth } from "./middlewares/auth.middleware";
import { requireAdminOrModerator } from "./middlewares/role.middleware";
import { recheckVerificationHandler } from "./controllers/ai-processing.controller";
import { env } from "./config/env";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { apiLimiter, authLimiter, adminLimiter } from "./middlewares/rate-limit.middleware";
import { sendSuccess } from "./utils/response-helper";
import { initDailyCollectorJob } from "./jobs/daily-collector.job";

const app = express();

// Security headers with strict CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", env.FRONTEND_URL, "https://*.supabase.co"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Apply rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/admin", adminLimiter);

app.get("/", (_req, res) => {
  sendSuccess(res, "BharatLens Backend API is running", {
    service: "BharatLens Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  sendSuccess(res, "Backend healthy", {
    service: "BharatLens Backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/docs", docsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationsRoutes);
// Saved items — single source of truth (use /api/saved, not /api/saved-items)
app.use("/api/saved", savedRoutes);
app.use("/api/collectors", collectorRoutes);
app.use("/api/pdf", pdfRoutes);
// Test-db route — only available in development
if (env.NODE_ENV !== "production") {
  app.use("/api/test-db", testRoutes);
}
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/ai-processing", aiProcessingRoutes);
app.use("/api/ai", chatRoutes);
// Content Updates route
app.use("/api/updates", contentUpdatesRoutes);

// Pipeline route moved to /api/pipeline to avoid route conflict with /api/ai/chat
app.use("/api/pipeline", pipelineRoutes);

// Dedicated verification recheck endpoint
const verificationRouter = Router();
verificationRouter.post("/recheck/:id", requireAuth, requireAdminOrModerator, recheckVerificationHandler);
app.use("/api/verification", verificationRouter);

app.use("/api/admin", adminRoutes);

initDailyCollectorJob();

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
