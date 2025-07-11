import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../utils';

/**
 * Validate cart add item request
 */
export const validateCartAddItemRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { productId, quantity, selectedSize, selectedColor } = req.body;

  // Validate productId (required)
  if (!productId || productId.trim() === '') {
    sendErrorResponse(res, 'Product ID là bắt buộc', 400);
    return;
  }

  // Validate MongoDB ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(productId)) {
    sendErrorResponse(res, 'Product ID phải là MongoDB ObjectId hợp lệ', 400);
    return;
  }

  // Validate quantity (required)
  if (quantity === undefined || quantity === null) {
    sendErrorResponse(res, 'Số lượng là bắt buộc', 400);
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    sendErrorResponse(res, 'Số lượng phải là số nguyên dương', 400);
    return;
  }

  // Validate selectedSize (optional)
  if (selectedSize !== undefined) {
    if (typeof selectedSize !== 'string') {
      sendErrorResponse(res, 'Size phải là chuỗi', 400);
      return;
    }
    
    const trimmedSize = selectedSize.trim();
    if (trimmedSize.length < 1 || trimmedSize.length > 10) {
      sendErrorResponse(res, 'Size phải từ 1-10 ký tự', 400);
      return;
    }
  }

  // Validate selectedColor (optional)
  if (selectedColor !== undefined) {
    if (typeof selectedColor !== 'string') {
      sendErrorResponse(res, 'Màu sắc phải là chuỗi', 400);
      return;
    }
    
    const trimmedColor = selectedColor.trim();
    if (trimmedColor.length < 1 || trimmedColor.length > 50) {
      sendErrorResponse(res, 'Màu sắc phải từ 1-50 ký tự', 400);
      return;
    }
  }

  next();
};

/**
 * Validate cart update item request
 */
export const validateCartUpdateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { quantity } = req.body;

  // Validate quantity (required)
  if (quantity === undefined || quantity === null) {
    sendErrorResponse(res, 'Số lượng là bắt buộc', 400);
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    sendErrorResponse(res, 'Số lượng phải là số nguyên dương', 400);
    return;
  }

  next();
};
