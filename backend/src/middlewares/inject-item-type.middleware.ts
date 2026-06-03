import type { RequestHandler, Request, Response, NextFunction } from "express";

/**
 * Middleware to inject itemType from the URL path into req.params
 * Handles routes like /schemes/:id, /scholarships/:id, /jobs/:id, /exams/:id
 * and converts them to {itemType: "scheme", id: "..."} format
 */
export function injectItemType(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const pathMatch = req.path.match(/^\/(schemes|scholarships|jobs|exams)\//);

    if (pathMatch) {
      const plural = pathMatch[1];
      // Convert plural to singular
      let itemType = plural;
      if (plural === "schemes") itemType = "scheme";
      else if (plural === "scholarships") itemType = "scholarship";
      else if (plural === "jobs") itemType = "job";
      else if (plural === "exams") itemType = "exam";

      // Inject itemType into params if not already present
      if (!req.params.itemType) {
        req.params.itemType = itemType;
      }
    }

    next();
  };
}
