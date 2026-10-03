import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled Application Error:', err);

  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    sendError(res, `A record with this ${target} already exists.`, 409);
    return;
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    sendError(res, 'Record not found or operation cannot be completed.', 404);
    return;
  }

  // Multer Error (e.g. file size limit)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File size exceeds maximum allowed limit of 5 MB.', 400);
      return;
    }
    sendError(res, `Upload error: ${err.message}`, 400);
    return;
  }

  // Custom validation or business error message
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, status);
};
