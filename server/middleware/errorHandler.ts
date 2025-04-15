/**
 * Centralized Express error handling middleware.
 *
 * Key responsibilities:
 * - Captures thrown errors in the request pipeline.
 * - Responds with a JSON message and appropriate HTTP status code.
 * - Defaults to status 500 and a generic message if not otherwise specified.
 * - Logs all errors to the console for server-side debugging.
 */


import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err);
}; 