import express from "express";
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
  savedItemsRoutes,
  collectorRoutes,
  pdfRoutes,
  docsRoutes,
  testRoutes,
  dashboardRoutes,
} from "./routes";
import { env } from "./config/env";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { sendSuccess } from "./utils/response-helper";
import { initDailyCollectorJob } from "./jobs/daily-collector.job";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

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
app.use("/api/saved", savedRoutes);
app.use("/api/saved-items", savedItemsRoutes);
app.use("/api/collectors", collectorRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/test-db", testRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);

initDailyCollectorJob();

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
