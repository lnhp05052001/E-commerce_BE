import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../utils';

/**
 * Validate BlogCategory request
 */
export const validateBlogCategoryRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    sendErrorResponse(res, 'Tên danh mục blog là bắt buộc', 400);
    return;
  }

  next();
};

/**
 * Validate Blog request
 */
export const validateBlogRequest = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Request body:', req.body); // Log the request body for debugging
  const { title, content, category } = req.body;

  if (!title || title.trim() === '') {
    sendErrorResponse(res, 'Tiêu đề bài viết là bắt buộc', 400);
    return;
  }

  if (!content || content.trim() === '') {
    sendErrorResponse(res, 'Nội dung bài viết là bắt buộc', 400);
    return;
  }

  if (!category) {
    sendErrorResponse(res, 'Danh mục bài viết là bắt buộc', 400);
    return;
  }

 

  next();
};
