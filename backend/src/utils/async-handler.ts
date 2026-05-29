import type { RequestHandler } from "express";

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };
}
