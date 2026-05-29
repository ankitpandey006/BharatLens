import type { RequestHandler, Request, Response, NextFunction } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/app-error";

export function validate(schema: ZodTypeAny, source: "params" | "body" | "query" = "params"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const input = req[source];
    const result = schema.safeParse(input);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(", ");
      return next(new AppError(`Invalid request ${source}: ${message}`, 400));
    }

    if (source === "params") {
      req.validatedParams = result.data as ParamsDictionary;
    } else if (source === "body") {
      req.validatedBody = result.data as Record<string, unknown>;
    }

    return next();
  };
}
