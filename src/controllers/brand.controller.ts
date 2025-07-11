import { Request, Response } from 'express';
import { BrandCategoryProductDTO, BrandRequest } from '../dtos/brand.dto';
import Brand from '../models/brand.model';
import Product from '../models/product.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Tạo thương hiệu mới
 * @route   POST /api/brand
 * @access  Private/Admin
 */
export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, logo, isActive }: BrandRequest = req.body;

  // Kiểm tra tên thương hiệu đã tồn tại chưa
  const brandExists = await Brand.findOne({ name });
  if (brandExists) {
    sendErrorResponse(res, 'Thương hiệu với tên này đã tồn tại', 400);
    return;
  }

  const brand = await Brand.create({
    name,
    description,
    logo,
    isActive: isActive !== undefined ? isActive : true
  });

  sendSuccessResponse(res, 'Thương hiệu được tạo thành công', brand, 201);
});

/**
 * @desc    Cập nhật thông tin thương hiệu
 * @route   PUT /api/brand/:id
 * @access  Private/Admin
 */
export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, logo, isActive }: BrandRequest = req.body;

  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    sendErrorResponse(res, 'Không tìm thấy thương hiệu', 404);
    return;
  }

  // Kiểm tra xem tên mới đã tồn tại chưa (nếu có thay đổi tên)
  if (name !== brand.name) {
    const brandWithNewName = await Brand.findOne({ name });
    if (brandWithNewName) {
      sendErrorResponse(res, 'Thương hiệu với tên này đã tồn tại', 400);
      return;
    }
  }

  brand.name = name || brand.name;
  brand.description = description !== undefined ? description : brand.description;
  brand.logo = logo !== undefined ? logo : brand.logo;
  brand.isActive = isActive !== undefined ? isActive : brand.isActive;

  const updatedBrand = await brand.save();

  sendSuccessResponse(res, 'Cập nhật thương hiệu thành công', updatedBrand);
});

/**
 * @desc    Xóa thương hiệu
 * @route   DELETE /api/brand/:id
 * @access  Private/Admin
 */
export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return sendErrorResponse(res, 'Không tìm thấy thương hiệu', 404);
  }

  // Kiểm tra xem thương hiệu có sản phẩm không
  const hasProducts = await Product.exists({ brand: brand._id });
  
  if (hasProducts) {
    return sendErrorResponse(
      res, 
      'Không thể xóa thương hiệu này vì có các sản phẩm liên kết với nó', 
      400
    );
  }

  await brand.deleteOne();
  return sendSuccessResponse(res, 'Thương hiệu đã được xóa thành công', null, 200);
});

/**
 * @desc    Lấy thương hiệu theo ID
 * @route   GET /api/brand/:id
 * @access  Public
 */
export const getBrandById = asyncHandler(async (req: Request, res: Response) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return sendErrorResponse(res, 'Không tìm thấy thương hiệu', 404);
  }

  return sendSuccessResponse(res, 'Lấy thông tin thương hiệu thành công', brand);
});

/**
 * @desc    Lấy danh sách các thương hiệu
 * @route   GET /api/brand
 * @access  Public
 */
export const getAllBrands = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const search = req.query.search as string;
  const isActive = req.query.isActive === 'true';
  const hasIsActiveFilter = req.query.isActive !== undefined;

  let query: any = {};
  
  // Thêm điều kiện tìm kiếm theo tên nếu có
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  // Thêm điều kiện lọc theo trạng thái active nếu có
  if (hasIsActiveFilter) {
    query.isActive = isActive;
  }

  const totalItems = await Brand.countDocuments(query);
  const totalPages = Math.ceil(totalItems / size);
  
  const brands = await Brand.find(query)
    .skip(page * size)
    .limit(size)
    .sort({ createdAt: -1 });

  return sendSuccessResponse(
    res, 
    'Lấy danh sách thương hiệu thành công', 
    brands,
    200,
    {
      page: page + 1,
      totalPages,
      totalItems
    }
  );
});

/**
 * @desc    Lấy top 5 thương hiệu
 * @route   GET /api/brand/top5
 * @access  Public
 */
export const getTop5Brands = asyncHandler(async (req: Request, res: Response) => {
  // Sử dụng aggregation để đếm số sản phẩm trong mỗi thương hiệu
  const brands: BrandCategoryProductDTO[] = await Brand.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'brand',
        as: 'products'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        logo: 1,
        slug: 1,
        productCount: { $size: '$products' }
      }
    },
    { $sort: { productCount: -1 } },
    { $limit: 5 }
  ]);

  return sendSuccessResponse(res, 'Top 5 thương hiệu được lấy thành công', brands);
});
