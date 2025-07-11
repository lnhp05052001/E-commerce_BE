import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../utils';

/**
 * Validate Category request
 */
export const validateCategoryRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    sendErrorResponse(res, 'Tên danh mục là bắt buộc', 400);
    return;
  }
  
  // Kiểm tra trạng thái nếu được cung cấp
  if (req.body.isActive !== undefined && typeof req.body.isActive !== 'boolean') {
    sendErrorResponse(res, 'Trạng thái hoạt động phải là kiểu boolean', 400);
    return;
  }

  next();
};
