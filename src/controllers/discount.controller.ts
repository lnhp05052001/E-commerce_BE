import { DiscountDTO, DiscountRequest } from '@/dtos/discount.dto';
import { Request, Response } from 'express';
import Cart from '../models/cart.model';
import Discount, { DiscountType } from '../models/discount.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Tạo mã giảm giá mới
 * @route   POST /api/discounts
 * @access  Private/Admin
 */
export const createDiscount = asyncHandler(async (req: Request, res: Response) => {
  try {
     const discountDTO = req.body;
    
    // Kiểm tra dữ liệu hợp lệ
    await validateDiscountDTO(discountDTO);
    
    // Kiểm tra trùng lặp tên mã giảm giá
    await checkDuplicateDiscountName(discountDTO.name);
    
    // Kiểm tra trùng lặp mã giảm giá
    await checkDuplicateDiscountCode(discountDTO.discountCode);
    
    // Tạo mã giảm giá mới
    const discount = await Discount.create(discountDTO);
    
    return sendSuccessResponse(res, 'Mã giảm giá được tạo thành công', discount, 201);
  } catch (error: any) {
    if (error.code === 'VALIDATION_ERROR') {
      return sendErrorResponse(res, `Lỗi xác thực: ${error.message}`, 400);
    }
    if (error.code === 'DUPLICATE_NAME') {
      return sendErrorResponse(res, `Tên mã giảm giá đã tồn tại: ${error.message}`, 400);
    }
    if (error.code === 'DUPLICATE_CODE') {
      return sendErrorResponse(res, `Mã giảm giá đã tồn tại: ${error.message}`, 400);
    }
    
    return sendErrorResponse(res, `Lỗi máy chủ: ${error.message}`, 500);
  }
});

/**
 * @desc    Lấy thông tin mã giảm giá theo ID
 * @route   GET /api/discounts/:id
 * @access  Private/Admin
 */
export const getDiscountById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const discount = await Discount.findById(id);
    
    if (!discount) {
      return sendErrorResponse(res, 'Không tìm thấy mã giảm giá', 404);
    }
    
    return sendSuccessResponse(res, 'Lấy thông tin mã giảm giá thành công', discount);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi máy chủ: ${error.message}`, 500);
  }
});

/**
 * @desc    Cập nhật thông tin mã giảm giá
 * @route   PUT /api/discounts/:id
 * @access  Private/Admin
 */
export const updateDiscount = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discountDTO: DiscountDTO = req.body;
    
    // Kiểm tra mã giảm giá tồn tại
    const discount = await Discount.findById(id);
    
    if (!discount) {
      return sendErrorResponse(res, 'Không tìm thấy mã giảm giá', 404);
    }
    
    // Kiểm tra dữ liệu hợp lệ
    await validateDiscountDTO(discountDTO);
    
    // Kiểm tra trùng lặp tên mã giảm giá (nếu tên đã thay đổi)
    if (discountDTO.name !== discount.name) {
      await checkDuplicateDiscountName(discountDTO.name);
    }
    
    // Kiểm tra trùng lặp mã giảm giá (nếu mã đã thay đổi)
    if (discountDTO.discountCode !== discount.discountCode) {
      await checkDuplicateDiscountCode(discountDTO.discountCode);
    }
    
    // Cập nhật thông tin mã giảm giá
    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      discountDTO,
      { new: true, runValidators: true }
    );
    
    return sendSuccessResponse(res, 'Cập nhật mã giảm giá thành công', updatedDiscount);
  } catch (error: any) {
    if (error.code === 'VALIDATION_ERROR') {
      return sendErrorResponse(res, `Lỗi xác thực: ${error.message}`, 400);
    }
    if (error.code === 'DUPLICATE_NAME') {
      return sendErrorResponse(res, `Tên mã giảm giá đã tồn tại: ${error.message}`, 400);
    }
    if (error.code === 'DUPLICATE_CODE') {
      return sendErrorResponse(res, `Mã giảm giá đã tồn tại: ${error.message}`, 400);
    }
    
    return sendErrorResponse(res, `Lỗi máy chủ: ${error.message}`, 500);
  }
});

/**
 * @desc    Xóa mã giảm giá
 * @route   DELETE /api/discounts/:id
 * @access  Private/Admin
 */
export const deleteDiscount = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await Discount.findByIdAndDelete(id);
    
    return sendSuccessResponse(res, 'Xóa mã giảm giá thành công', null);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi máy chủ: ${error.message}`, 500);
  }
});

/**
 * @desc    Lấy danh sách mã giảm giá
 * @route   GET /api/discounts
 * @access  Private/Admin
 */
export const getAllDiscounts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { search, isActive = true, page = 0, size = 10 } = req.query;
    
    const query: any = {};
    
    // Áp dụng bộ lọc
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { discountCode: { $regex: search as string, $options: 'i' } }
      ];
    }
    
 
    // Tính toán phân trang
    const pageNumber = parseInt(page as string) || 0;
    const pageSize = parseInt(size as string) || 10;
    const skip = pageNumber * pageSize;
    
    // Thực hiện truy vấn
    const discounts = await Discount.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    
    const totalDiscounts = await Discount.countDocuments(query);
    
    const pagination = {
      page: pageNumber + 1,
      totalPages: Math.ceil(totalDiscounts / pageSize),
      totalItems: totalDiscounts
    };
    
    return sendSuccessResponse(res, 'Lấy danh sách mã giảm giá thành công', discounts, 200, pagination);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi máy chủ: ${error.message}`, 500);
  }
});

/**
 * @desc    Áp dụng mã giảm giá vào giỏ hàng
 * @route   POST /api/discounts/apply
 * @access  Private
 */
export const applyDiscount = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return sendErrorResponse(res, 'Bạn chưa đăng nhập', 401);
    }
    
    const { code }: DiscountRequest = req.body;
    
    // Kiểm tra mã giảm giá
    const discount = await Discount.findOne({ 
      discountCode: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    if (!discount) {
      return sendErrorResponse(res, 'Mã giảm giá không tồn tại hoặc hết hiệu lực', 400);
    }
    
    // Kiểm tra giới hạn sử dụng
    if (discount.maxUsage > 0 && discount.usageCount >= discount.maxUsage) {
      return sendErrorResponse(res, 'Mã giảm giá đã hết lượt sử dụng', 400);
    }
    
    // Lấy thông tin giỏ hàng
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items',
      populate: { path: 'product' }
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return sendErrorResponse(res, 'Giỏ hàng trống', 400);
    }
    
    // Tính tổng giá trị giỏ hàng
    const cartTotal = cart.totalPrice;
    
    // Kiểm tra giá trị đơn hàng tối thiểu
    if (cartTotal < discount.minOrderValue) {
      return sendErrorResponse(
        res, 
        `Giá trị đơn hàng phải từ ${discount.minOrderValue} trở lên để sử dụng mã giảm giá này`, 
        400
      );
    }
    
    // Tính toán giá trị giảm giá
    let discountAmount = 0;
    
    if (discount.discountType === DiscountType.PERCENTAGE) {
      // Giảm theo phần trăm
      discountAmount = (cartTotal * discount.discountValue) / 100;
      
      // Giới hạn số tiền giảm tối đa
      if (discount.maxDiscountAmount > 0 && discountAmount > discount.maxDiscountAmount) {
        discountAmount = discount.maxDiscountAmount;
      }
    } else {
      // Giảm theo số tiền cố định
      discountAmount = discount.discountValue;
    }
    
    // Cập nhật số lần sử dụng
    discount.usageCount += 1;
    await discount.save();
    
    return sendSuccessResponse(res, 'Áp dụng mã giảm giá thành công', {
      discountAmount,
      cartTotal,
      finalAmount: cartTotal - discountAmount
    });
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi máy chủ: ${error.message}`, 500);
  }
});

/**
 * @desc    Tìm kiếm mã giảm giá
 * @route   GET /api/discounts/search
 * @access  Private/Admin
 */
export const searchDiscounts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { code, name, page = 0, size = 10 } = req.query;
    
    const query: any = {};
    
    if (code) {
      query.discountCode = { $regex: code as string, $options: 'i' };
    }
    
    if (name) {
      query.name = { $regex: name as string, $options: 'i' };
    }
    
    // Tính toán phân trang
    const pageNumber = parseInt(page as string) || 0;
    const pageSize = parseInt(size as string) || 10;
    const skip = pageNumber * pageSize;
    
    // Thực hiện truy vấn
    const discounts = await Discount.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    
    const totalDiscounts = await Discount.countDocuments(query);
    
    const pagination = {
      page: pageNumber + 1,
      totalPages: Math.ceil(totalDiscounts / pageSize),
      totalItems: totalDiscounts
    };
    
    return sendSuccessResponse(res, 'Tìm kiếm mã giảm giá thành công', discounts, 200, pagination);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi máy chủ: ${error.message}`, 500);
  }
});

// Helper functions
const validateDiscountDTO = async (discountDTO: DiscountDTO) => {
  // Kiểm tra tên mã giảm giá
  if (!discountDTO.name || discountDTO.name.trim() === '') {
    const error: any = new Error('Tên mã giảm giá không được để trống');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  
  // Kiểm tra mã giảm giá
  if (!discountDTO.discountCode || discountDTO.discountCode.trim() === '') {
    const error: any = new Error('Mã giảm giá không được để trống');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  
  // Kiểm tra loại giảm giá
  if (!Object.values(DiscountType).includes(discountDTO.discountType)) {
    const error: any = new Error('Loại giảm giá không hợp lệ');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  
  // Kiểm tra giá trị giảm giá
  if (discountDTO.discountValue <= 0) {
    const error: any = new Error('Giá trị giảm giá phải lớn hơn 0');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  
  // Nếu là giảm theo phần trăm, phải <= 100%
  if (discountDTO.discountType === DiscountType.PERCENTAGE && discountDTO.discountValue > 100) {
    const error: any = new Error('Phần trăm giảm giá không được vượt quá 100%');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  
  // Kiểm tra ngày hiệu lực
  if (!discountDTO.startDate || !discountDTO.endDate) {
    const error: any = new Error('Ngày bắt đầu và kết thúc không được để trống');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  
  const startDate = new Date(discountDTO.startDate);
  const endDate = new Date(discountDTO.endDate);
  
  if (startDate >= endDate) {
    const error: any = new Error('Ngày bắt đầu phải sớm hơn ngày kết thúc');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
};

const checkDuplicateDiscountName = async (name: string) => {
  const existingDiscount = await Discount.findOne({ name });
  
  if (existingDiscount) {
    const error: any = new Error(`Tên mã giảm giá '${name}' đã tồn tại`);
    error.code = 'DUPLICATE_NAME';
    throw error;
  }
};

const checkDuplicateDiscountCode = async (code: string) => {
  const existingDiscount = await Discount.findOne({ 
    discountCode: code.toUpperCase() 
  });
  
  if (existingDiscount) {
    const error: any = new Error(`Mã giảm giá '${code}' đã tồn tại`);
    error.code = 'DUPLICATE_CODE';
    throw error;
  }
};
