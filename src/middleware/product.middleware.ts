import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../utils';

/**
 * Validate Product request
 */
export const validateProductRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { name, description, price, category, stock } = req.body;

  if (!name || name.trim() === '') {
    sendErrorResponse(res, 'Tên sản phẩm là bắt buộc', 400);
    return;
  }

  if (!description || description.trim() === '') {
    sendErrorResponse(res, 'Mô tả sản phẩm là bắt buộc', 400);
    return;
  }

  if (price === undefined || isNaN(price) || price < 0) {
    sendErrorResponse(res, 'Giá sản phẩm phải là số dương', 400);
    return;
  }

  if (!category) {
    sendErrorResponse(res, 'Danh mục sản phẩm là bắt buộc', 400);
    return;
  }

  if (stock === undefined || isNaN(stock) || stock < 0) {
    sendErrorResponse(res, 'Số lượng tồn kho phải là số dương hoặc bằng 0', 400);
    return;
  }

  // Validate salePrice if provided
  if (req.body.salePrice !== undefined) {
    const { salePrice } = req.body;
    if (isNaN(salePrice) || salePrice < 0) {
      sendErrorResponse(res, 'Giá khuyến mãi phải là số dương hoặc bằng 0', 400);
      return;
    }
  }

  // Validate gender if provided
  if (req.body.gender !== undefined) {
    const validGenders = ['Men', 'Women', 'Unisex', 'Children'];
    if (!validGenders.includes(req.body.gender)) {
      sendErrorResponse(res, 'Giới tính phải là một trong các giá trị: Men, Women, Unisex, Children', 400);
      return;
    }
  }

  // Validate sizes if provided
  if (req.body.sizes !== undefined && !Array.isArray(req.body.sizes)) {
    sendErrorResponse(res, 'Kích cỡ phải là một mảng các chuỗi', 400);
    return;
  }

  // Validate colors if provided
  if (req.body.colors !== undefined && !Array.isArray(req.body.colors)) {
    sendErrorResponse(res, 'Màu sắc phải là một mảng các chuỗi', 400);
    return;
  }

  next();
};
