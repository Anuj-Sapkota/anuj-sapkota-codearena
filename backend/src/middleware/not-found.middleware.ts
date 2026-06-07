import type { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/service.error.js";

export const notFoundHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // We initialize the error here and pass it to the next middleware
  console.log("NOT FOUND MIDDLEWARE")
  const message = `RESOURCE_NOT_FOUND: [${req.method}] ${req.originalUrl}`;
  
  // By passing the error to next(), Express skips all regular routes 
  // and goes straight to your error-handling middleware.
  next(new ServiceError(message, 404));
};