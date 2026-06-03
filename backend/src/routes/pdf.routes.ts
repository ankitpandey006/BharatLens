import { Router } from "express";
import extractPdfHandler from "../controllers/pdf.controller";

const router = Router();

router.post("/extract", extractPdfHandler);

export default router;
