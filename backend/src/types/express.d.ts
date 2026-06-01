import type { ParamsDictionary } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      validatedParams?: ParamsDictionary;
      validatedBody?: Record<string, unknown>;
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export {};
