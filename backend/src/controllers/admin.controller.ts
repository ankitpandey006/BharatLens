import type { Request, Response } from "express";
import { successResponse } from "../utils/api-response";
import { approveAdminContent, fetchPendingAdminContent, rejectAdminContent } from "../services/admin.service";

export function getPendingAdminContentHandler(_req: Request, res: Response): void {
  const pendingContent = fetchPendingAdminContent();
  res.status(200).json(successResponse("Pending admin content fetched successfully", pendingContent));
}

export function approveAdminContentHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: string };
  const approvedContent = approveAdminContent(id);

  if (!approvedContent) {
    res.status(404).json({ success: false, message: "Content not found" });
    return;
  }

  res.status(200).json(successResponse("Content approved successfully", approvedContent));
}

export function rejectAdminContentHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: string };
  const rejectedContent = rejectAdminContent(id);

  if (!rejectedContent) {
    res.status(404).json({ success: false, message: "Content not found" });
    return;
  }

  res.status(200).json(successResponse("Content rejected successfully", rejectedContent));
}
