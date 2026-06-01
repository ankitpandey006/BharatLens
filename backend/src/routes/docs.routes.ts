import { Router } from "express";
import { openApiDocument } from "../docs/openapi";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BharatLens API documentation metadata",
    data: openApiDocument,
  });
});

export default router;
