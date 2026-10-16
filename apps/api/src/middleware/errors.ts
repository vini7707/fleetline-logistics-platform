import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let status = 500,
    code = "INTERNAL_ERROR",
    message = "An unexpected error occurred";
  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
  } else if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Request data is invalid";
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = "INVALID_ID";
    message = "A resource identifier is invalid";
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "The requested data could not be saved";
  } else if (
    (
      err as {
        code?: number;
      }
    )?.code === 11000
  ) {
    status = 409;
    code = "DUPLICATE_RESOURCE";
    message = "A record with that unique value already exists";
  }
  if (status === 500)
    console.error(
      JSON.stringify({
        level: "error",
        requestId: req.requestId,
        message: err instanceof Error ? err.message : "Unknown error",
      }),
    );
  res
    .status(status)
    .json({ error: { code, message, requestId: req.requestId } });
};
