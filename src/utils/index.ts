import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';

dotenv.config();

// Tạo JWT token
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '30d',
    }
  );
};

// Xử lý các lỗi API và trả về định dạng chuẩn
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    
    // Capture đúng stack trace để định vị lỗi
    Error.captureStackTrace(this, this.constructor);
  }
}

// Hàm tiện ích để catch các lỗi async trong Express
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Hàm để trả về response chuẩn
export const sendResponse = (
  res: Response,
  statusCode: number,
  status: 'success' | 'error' | 'fail',
  message: string,
  data?: any,
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
  }
) => {
  return res.status(statusCode).json({
    status,
    message,
    data: data || [],
    pagination
  });
};

// Hàm trả về response thành công
export const sendSuccessResponse = (
  res: Response,
  message: string = 'Operation successful',
  data: any = [],
  statusCode: number = 200,
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
  }
) => {
  return sendResponse(res, statusCode, 'success', message, data, pagination);
};

// Hàm trả về response thất bại
export const sendErrorResponse = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500
) => {
  return sendResponse(res, statusCode, 'error', message);
};

// Interface cho thông tin email
export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Hàm gửi email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Trong môi trường thực tế, bạn sẽ cần sử dụng một thư viện như nodemailer
    // Đây là một hàm giả định để làm ví dụ
    console.log('Gửi email...');
    console.log('Đến:', options.to);
    console.log('Chủ đề:', options.subject);
    console.log('Nội dung:', options.text);
    
    // Giả định email đã được gửi thành công
    return true;
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    return false;
  }
};

// Export from slug.util.ts
export * from './slug.util';

