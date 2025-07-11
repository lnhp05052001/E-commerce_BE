import { NextFunction, Request, Response } from 'express';

// Middleware xử lý lỗi không tìm thấy route
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware xử lý các lỗi
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    data: [],
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
