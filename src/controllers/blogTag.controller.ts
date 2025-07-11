import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tag from '../models/tag.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Lấy tất cả tags
 * @route   GET /api/blog-tags
 * @access  Public
 */
export const getAllTags = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const search = req.query.search as string;

  // Tạo query dựa trên tham số tìm kiếm
  const query: any = {};
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  // Đếm tổng số tags thỏa mãn điều kiện
  const totalItems = await Tag.countDocuments(query);
  const totalPages = Math.ceil(totalItems / size);
  
  // Lấy danh sách tags với phân trang
  const tags = await Tag.find(query)
    .sort({ createdAt: -1 })
    .skip(page * size)
    .limit(size);

  const message = tags.length === 0 ? 'Không tìm thấy tags nào' : 'Lấy danh sách tags thành công';
  
  return sendSuccessResponse(
    res, 
    message, 
    tags,
    200,
    {
      page: page + 1,
      totalPages,
      totalItems
    }
  );
});

/**
 * @desc    Lấy tag theo ID
 * @route   GET /api/blog-tags/:id
 * @access  Public
 */
export const getTagById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendErrorResponse(res, 'ID tag không hợp lệ', 400);
  }

  const tag = await Tag.findById(id);
  
  if (!tag) {
    return sendErrorResponse(res, 'Tag không tồn tại', 404);
  }

  return sendSuccessResponse(res, 'Lấy thông tin tag thành công', tag);
});

/**
 * @desc    Lấy tags theo blog ID
 * @route   GET /api/blog-tags/blog/:id
 * @access  Public
 */
export const getTagsByBlogId = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendErrorResponse(res, 'ID blog không hợp lệ', 400);
  }

  const blog = await mongoose.model('Blog').findById(id).populate('tags');
  
  if (!blog) {
    return sendErrorResponse(res, 'Blog không tồn tại', 404);
  }

  return sendSuccessResponse(res, 'Lấy danh sách tags của blog thành công', blog.tags);
});

/**
 * @desc    Tạo tag mới
 * @route   POST /api/blog-tags
 * @access  Private/Admin
 */
export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return sendErrorResponse(res, 'Tên tag là bắt buộc', 400);
  }

  // Kiểm tra xem tag đã tồn tại chưa
  const tagExists = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (tagExists) {
    return sendErrorResponse(res, 'Tag với tên này đã tồn tại', 400);
  }

  const tag = await Tag.create({ name });

  return sendSuccessResponse(res, 'Tag được tạo thành công', tag, 201);
});

/**
 * @desc    Cập nhật tag
 * @route   PUT /api/blog-tags/:id
 * @access  Private/Admin
 */
export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendErrorResponse(res, 'ID tag không hợp lệ', 400);
  }

  if (!name) {
    return sendErrorResponse(res, 'Tên tag là bắt buộc', 400);
  }

  // Kiểm tra xem tag có tồn tại không
  const tag = await Tag.findById(id);
  if (!tag) {
    return sendErrorResponse(res, 'Tag không tồn tại', 404);
  }

  // Kiểm tra xem tên mới đã tồn tại chưa (nếu khác tên hiện tại)
  if (name.toLowerCase() !== tag.name.toLowerCase()) {
    const tagExists = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (tagExists) {
      return sendErrorResponse(res, 'Tag với tên này đã tồn tại', 400);
    }
  }

  tag.name = name;
  const updatedTag = await tag.save();

  return sendSuccessResponse(res, 'Tag được cập nhật thành công', updatedTag);
});

/**
 * @desc    Xóa tag
 * @route   DELETE /api/blog-tags/:id
 * @access  Private/Admin
 */
export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendErrorResponse(res, 'ID tag không hợp lệ', 400);
  }

  const tag = await Tag.findById(id);
  
  if (!tag) {
    return sendErrorResponse(res, 'Tag không tồn tại', 404);
  }

  // Kiểm tra xem tag có đang được sử dụng trong blogs không
  const blogCount = await mongoose.model('Blog').countDocuments({ tags: id });
  if (blogCount > 0) {
    return sendErrorResponse(res, 
      `Tag này đang được sử dụng trong ${blogCount} bài viết. Không thể xóa.`, 
      400
    );
  }

  await Tag.findByIdAndDelete(id);
  
  return sendSuccessResponse(res, 'Tag được xóa thành công');
});
