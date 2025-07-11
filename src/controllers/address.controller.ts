import { NextFunction, Request, Response } from 'express';
import { AddressRequest } from '../dtos/address.dto';
import Address from '../models/address.model';
import User from '../models/user.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Tạo địa chỉ mới
 * @route   POST /api/address
 * @access  Private
 */
export const createAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  const addressData: AddressRequest = req.body;

  // Tạo địa chỉ mới
  const address = new Address({
    ...addressData,
    isDefault: false, // Mặc định không phải địa chỉ mặc định
    user: userId,
  });

  const savedAddress = await address.save();

  // Thêm ID địa chỉ vào mảng addresses của người dùng
  await User.findByIdAndUpdate(userId, {
    $push: { addresses: savedAddress._id },
  });

  sendSuccessResponse(res, 'Địa chỉ đã được tạo thành công', savedAddress, 201);
});

/**
 * @desc    Cập nhật địa chỉ
 * @route   PUT /api/address/:id
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const addressId = req.params.id;
  const userId = req.user._id;
  const addressData: AddressRequest = req.body;

  // Kiểm tra địa chỉ tồn tại và thuộc về người dùng hiện tại
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    return sendErrorResponse(res, 'Địa chỉ không tồn tại', 404);
  }

  // Cập nhật địa chỉ
  Object.assign(address, addressData);
  const updatedAddress = await address.save();

  sendSuccessResponse(res, 'Địa chỉ đã được cập nhật thành công', updatedAddress);
});

/**
 * @desc    Đặt địa chỉ làm mặc định
 * @route   PUT /api/address/:id/default
 * @access  Private
 */
export const toggleDefaultAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const addressId = req.params.id;
  const userId = req.user._id;

  // Kiểm tra địa chỉ tồn tại và thuộc về người dùng hiện tại
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    return sendErrorResponse(res, 'Địa chỉ không tồn tại', 404);
  }

  // Đặt tất cả địa chỉ của người dùng thành không phải mặc định
  await Address.updateMany({ user: userId }, { isDefault: false });

  // Đặt địa chỉ được chọn làm mặc định
  address.isDefault = true;
  await address.save();

  sendSuccessResponse(res, 'Đã đặt địa chỉ làm mặc định thành công');
});

/**
 * @desc    Xóa địa chỉ
 * @route   DELETE /api/address/:id
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const addressId = req.params.id;
  const userId = req.user._id;

  // Kiểm tra địa chỉ tồn tại và thuộc về người dùng hiện tại
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    return sendErrorResponse(res, 'Địa chỉ không tồn tại', 404);
  }

  // Xóa địa chỉ
  await address.deleteOne();

  // Cập nhật mảng addresses của người dùng
  await User.findByIdAndUpdate(userId, {
    $pull: { addresses: addressId },
  });

  sendSuccessResponse(res, 'Địa chỉ đã được xóa thành công');
});

/**
 * @desc    Lấy địa chỉ theo ID
 * @route   GET /api/address/:id
 * @access  Private
 */
export const getAddressById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const addressId = req.params.id;
  const userId = req.user._id;

  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    return sendErrorResponse(res, 'Địa chỉ không tồn tại', 404);
  }

  sendSuccessResponse(res, 'Đã lấy địa chỉ thành công', address);
});

/**
 * @desc    Lấy tất cả địa chỉ của người dùng
 * @route   GET /api/address
 * @access  Private
 */
export const getAllAddresses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  sendSuccessResponse(res, 'Đã lấy danh sách địa chỉ thành công', addresses);
});

/**
 * @desc    Lấy địa chỉ mặc định của người dùng
 * @route   GET /api/address/default
 * @access  Private
 */
export const getDefaultAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  const address = await Address.findOne({ user: userId, isDefault: true });
  if (!address) {
    return sendErrorResponse(res, 'Không tìm thấy địa chỉ mặc định', 404);
  }

  sendSuccessResponse(res, 'Đã lấy địa chỉ mặc định thành công', address);
});
