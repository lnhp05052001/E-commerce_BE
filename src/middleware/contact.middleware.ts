import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../utils';

/**
 * Validate Contact request
 */
export const validateContactRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, message } = req.body;

  // Kiểm tra tên
  if (!name || name.trim() === '') {
    sendErrorResponse(res, 'Tên là bắt buộc', 400);
    return;
  }
  
  // Kiểm tra email
  if (!email || email.trim() === '') {
    sendErrorResponse(res, 'Email là bắt buộc', 400);
    return;
  }
  
  // Kiểm tra định dạng email
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    sendErrorResponse(res, 'Email không hợp lệ', 400);
    return;
  }
  
  // Kiểm tra nội dung tin nhắn
  if (!message || message.trim() === '') {
    sendErrorResponse(res, 'Nội dung tin nhắn là bắt buộc', 400);
    return;
  }

  next();
};
