import { Request, Response } from 'express';
import { CategoryRequest } from '../dtos/category.dto';
import Category from '../models/category.model';
import Product from '../models/product.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Tạo danh mục sản phẩm mới
 * @route   POST /api/category
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, isActive }: CategoryRequest = req.body;

  // Kiểm tra tên danh mục đã tồn tại chưa
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return sendErrorResponse(res, 'Danh mục với tên này đã tồn tại', 400);
  }

  const category = await Category.create({
    name,
    description,
    image,
    isActive
  });

  return sendSuccessResponse(res, 'Danh mục được tạo thành công', category, 201);
});

/**
 * @desc    Lấy một danh mục theo ID
 * @route   GET /api/category/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendErrorResponse(res, 'Không tìm thấy danh mục', 404);
  }

  return sendSuccessResponse(res, 'Lấy thông tin danh mục thành công', category);
});

/**
 * @desc    Lấy danh sách các danh mục
 * @route   GET /api/category
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
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

  const totalItems = await Category.countDocuments(query);
  const totalPages = Math.ceil(totalItems / size);
  
  const categories = await Category.find(query)
    .skip(page * size)
    .limit(size)
    .sort({ createdAt: -1 });

  return sendSuccessResponse(
    res, 
    'Lấy danh sách danh mục thành công', 
    categories,
    200,
    {
      page: page + 1,
      totalPages,
      totalItems
    }
  );
});

/**
 * @desc    Cập nhật thông tin danh mục
 * @route   PUT /api/category/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, isActive }: CategoryRequest = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendErrorResponse(res, 'Không tìm thấy danh mục', 404);
  }

  // Kiểm tra xem tên mới đã tồn tại chưa (nếu có thay đổi tên)
  if (name !== category.name) {
    const categoryWithNewName = await Category.findOne({ name });
    if (categoryWithNewName) {
      return sendErrorResponse(res, 'Danh mục với tên này đã tồn tại', 400);
    }
  }

  category.name = name || category.name;
  category.description = description !== undefined ? description : category.description;
  category.image = image !== undefined ? image : category.image;
  category.isActive = isActive !== undefined ? isActive : category.isActive;

  const updatedCategory = await category.save();

  return sendSuccessResponse(res, 'Cập nhật danh mục thành công', updatedCategory);
});

/**
 * @desc    Xóa danh mục
 * @route   DELETE /api/category/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendErrorResponse(res, 'Không tìm thấy danh mục', 404);
  }

  // Kiểm tra xem danh mục có sản phẩm không
  const hasProducts = await Product.exists({ category: category._id });
  
  if (hasProducts) {
    return sendErrorResponse(
      res, 
      'Không thể xóa danh mục này vì có các sản phẩm liên kết với nó', 
      400
    );
  }

  await category.deleteOne();
  return sendSuccessResponse(res, 'Danh mục đã được xóa thành công', null, 200);
});

/**
 * @desc    Lấy các danh mục kèm số lượng sản phẩm
 * @route   GET /api/category/product-count
 * @access  Public
 */
export const getCategoriesWithProductCount = asyncHandler(async (req: Request, res: Response) => {
  const categoriesWithCount = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        image: 1,
        isActive: 1,
        slug: 1,
        productCount: { $size: '$products' },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]);

  return sendSuccessResponse(res, 'Lấy danh mục với số lượng sản phẩm thành công', categoriesWithCount);
});
