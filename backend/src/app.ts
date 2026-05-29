import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { schemeRoutes, scholarshipRoutes, jobRoutes, examRoutes, adminRoutes } from "./routes";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "BharatLens Backend API is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "BharatLens Backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/schemes", schemeRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;