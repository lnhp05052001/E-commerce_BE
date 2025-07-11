import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../utils';

export const validateAddressRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, streetAddress, city, state, zipCode } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!firstName || firstName.trim() === '') {
    sendErrorResponse(res, 'Tên là bắt buộc', 400);
    return;
  }
  
  if (!lastName || lastName.trim() === '') {
    sendErrorResponse(res, 'Họ là bắt buộc', 400);
    return;
  }
  
  if (!streetAddress || streetAddress.trim() === '') {
    sendErrorResponse(res, 'Địa chỉ đường phố là bắt buộc', 400);
    return;
  }
  
  if (!city || city.trim() === '') {
    sendErrorResponse(res, 'Thành phố là bắt buộc', 400);
    return;
  }
  
  if (!state || state.trim() === '') {
    sendErrorResponse(res, 'Tỉnh/Thành phố là bắt buộc', 400);
    return;
  }
  
  if (!zipCode || zipCode.trim() === '') {
    sendErrorResponse(res, 'Mã bưu điện là bắt buộc', 400);
    return;
  }
  
  // Kiểm tra định dạng email nếu có
  if (req.body.email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(req.body.email)) {
      sendErrorResponse(res, 'Email không hợp lệ', 400);
      return;
    }
  }

  next();
};

export const validateOrderRequest = (req: Request, res: Response, next: NextFunction): void => {
  const {
    username,
    paymentMethod,
    orderItems,
    discountAmount,
    finalAmount,
    totalAmount,
    address,
    discountCode
  } = req.body;

  // Kiểm tra tên người dùng
  if (!username || username.trim() === '') {
    sendErrorResponse(res, 'Tên người dùng là bắt buộc', 400);
    return;
  }

  // Kiểm tra danh sách sản phẩm
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    sendErrorResponse(res, 'Đơn hàng phải có ít nhất một sản phẩm', 400);
    return;
  }

  // Kiểm tra từng sản phẩm
  for (const item of orderItems) {
    if (!item.product) {
      sendErrorResponse(res, 'Mỗi sản phẩm phải có ID', 400);
      return;
    }
    if (!item.name) {
      sendErrorResponse(res, 'Mỗi sản phẩm phải có tên', 400);
      return;
    }
    if (!item.quantity || item.quantity <= 0) {
      sendErrorResponse(res, 'Số lượng sản phẩm phải lớn hơn 0', 400);
      return;
    }
    if (!item.price || item.price < 0) {
      sendErrorResponse(res, 'Giá sản phẩm không được là số âm', 400);
      return;
    }
  }

  // Kiểm tra địa chỉ giao hàng
  if (!address || address.trim() === '') {
    sendErrorResponse(res, 'Địa chỉ giao hàng là bắt buộc', 400);
    return;
  }

  // Kiểm tra phương thức thanh toán
  if (!paymentMethod || paymentMethod.trim() === '') {
    sendErrorResponse(res, 'Phương thức thanh toán là bắt buộc', 400);
    return;
  }

  // Kiểm tra giá trị giảm giá
  if (discountAmount === undefined || discountAmount < 0) {
    sendErrorResponse(res, 'Giá trị giảm giá không hợp lệ', 400);
    return;
  }

  // Kiểm tra giá trị cuối cùng
  if (finalAmount === undefined || finalAmount < 0) {
    sendErrorResponse(res, 'Giá trị cuối cùng không hợp lệ', 400);
    return;
  }

  // Kiểm tra tổng giá trị đơn hàng
  if (totalAmount === undefined || totalAmount < 0) {
    sendErrorResponse(res, 'Tổng giá trị đơn hàng không hợp lệ', 400);
    return;
  }

  // Kiểm tra mã giảm giá (nếu có)
  if (discountCode && discountCode.trim() === '') {
    sendErrorResponse(res, 'Mã giảm giá không hợp lệ', 400);
    return;
  }

  next();
};

export const validateOrderStatusUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (!status) {
    sendErrorResponse(res, 'Trạng thái đơn hàng là bắt buộc', 400);
    return;
  }

  if (!validStatuses.includes(status)) {
    sendErrorResponse(res, 'Trạng thái đơn hàng không hợp lệ', 400);
    return;
  }

  next();
};
