import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response => {
  const body: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 400,
  errors?: any[]
): Response => {
  const body: ApiResponse = {
    success: false,
    error: message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(body);
};
