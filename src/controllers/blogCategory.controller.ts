import { Request, Response } from 'express';
import { BlogCategoryRequest } from '../dtos/blog.dto';
import Blog from '../models/blog.model';
import BlogCategory from '../models/blogCategory.model';
import { ICategoryPopulated } from '../types/populate-helper';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Tạo danh mục blog mới
 * @route   POST /api/blog-category
 * @access  Private/Admin
 */
export const createBlogCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description }: BlogCategoryRequest = req.body;

  // Kiểm tra tên danh mục đã tồn tại chưa
  const categoryExists = await BlogCategory.findOne({ name });
  if (categoryExists) {
    return sendErrorResponse(res, 'Danh mục blog với tên này đã tồn tại', 400);
  }

  const blogCategory = await BlogCategory.create({
    name,
    description,
  });

  return sendSuccessResponse(res, 'Danh mục blog được tạo thành công', blogCategory, 201);
});

/**
 * @desc    Lấy một danh mục blog theo ID
 * @route   GET /api/blog-category/:id
 * @access  Public
 */
export const getBlogCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const blogCategory = await BlogCategory.findById(req.params.id);

  if (!blogCategory) {
    return sendErrorResponse(res, 'Không tìm thấy danh mục blog', 404);
  }

  return sendSuccessResponse(res, 'Lấy thông tin danh mục blog thành công', blogCategory);
});

/**
 * @desc    Lấy danh sách các danh mục blog
 * @route   GET /api/blog-category
 * @access  Public
 */
export const getAllBlogCategories = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const name = req.query.name as string;

  const query = name ? { name: { $regex: name, $options: 'i' } } : {};

  const totalItems = await BlogCategory.countDocuments(query);
  const totalPages = Math.ceil(totalItems / size);
  
  const blogCategories = await BlogCategory.find(query)
    .skip(page * size)
    .limit(size)
    .sort({ createdAt: -1 });

  return sendSuccessResponse(
    res, 
    'Lấy danh sách danh mục blog thành công', 
    blogCategories,
    200,
    {
      page: page + 1,
      totalPages,
      totalItems
    }
  );
});

/**
 * @desc    Cập nhật thông tin danh mục blog
 * @route   PUT /api/blog-category/:id
 * @access  Private/Admin
 */
export const updateBlogCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description }: BlogCategoryRequest = req.body;

  const blogCategory = await BlogCategory.findById(req.params.id);

  if (!blogCategory) {
    return sendErrorResponse(res, 'Không tìm thấy danh mục blog', 404);
  }

  // Kiểm tra xem tên mới đã tồn tại chưa (nếu có thay đổi tên)
  if (name !== blogCategory.name) {
    const categoryWithNewName = await BlogCategory.findOne({ name });
    if (categoryWithNewName) {
      return sendErrorResponse(res, 'Danh mục blog với tên này đã tồn tại', 400);
    }
  }

  blogCategory.name = name || blogCategory.name;
  blogCategory.description = description !== undefined ? description : blogCategory.description;

  const updatedCategory = await blogCategory.save();

  return sendSuccessResponse(res, 'Cập nhật danh mục blog thành công', updatedCategory);
});

/**
 * @desc    Xóa danh mục blog
 * @route   DELETE /api/blog-category/:id
 * @access  Private/Admin
 */
export const deleteBlogCategory = asyncHandler(async (req: Request, res: Response) => {
  const blogCategory = await BlogCategory.findById(req.params.id);

  if (!blogCategory) {
    return sendErrorResponse(res, 'Không tìm thấy danh mục blog', 404);
  }

  // Kiểm tra xem danh mục có bài viết không
  const hasBlogs = await Blog.exists({ category: blogCategory._id });
  
  if (hasBlogs) {
    return sendErrorResponse(
      res, 
      'Không thể xóa danh mục này vì có các bài viết liên kết với nó', 
      400
    );
  }

  await blogCategory.deleteOne();
  return sendSuccessResponse(res, 'Danh mục blog đã được xóa thành công', null, 200);
});

/**
 * @desc    Lấy các danh mục blog kèm số lượng bài viết
 * @route   GET /api/blog-category/blog-count
 * @access  Public
 */
export const getCategoriesWithBlogCount = asyncHandler(async (req: Request, res: Response) => {
  const categories = await BlogCategory.aggregate([
    {
      $lookup: {
        from: 'blogs',
        localField: '_id',
        foreignField: 'category',
        as: 'blogs',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        slug: 1,
        blogCount: { $size: '$blogs' },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]).exec() as ICategoryPopulated[];

  return sendSuccessResponse(res, 'Lấy danh mục với số lượng bài viết thành công', categories);
});
