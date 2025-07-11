import { Request, Response } from 'express';
import { BlogRequest } from '../dtos/blog.dto';
import Blog from '../models/blog.model';
import { IBlogPopulated } from '../types/populate-helper';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Tạo bài viết mới
 * @route   POST /api/blog
 * @access  Private
 */
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  try {
     const blogData: BlogRequest = req.body;
    
    // Thiết lập tác giả là người dùng hiện tại nếu chưa được cung cấp
    if (!blogData.author && req.user) {
      blogData.author = req.user._id;
    }

    const blog = await Blog.create(blogData);

    // Populate thông tin category và author
    const populatedBlog = await Blog.findById(blog._id)
      .populate<IBlogPopulated>('category', 'name slug')
      .populate<IBlogPopulated>('author', 'username email')
      .populate<IBlogPopulated>('tags', 'name');

    return sendSuccessResponse(res, 'Bài viết được tạo thành công', populatedBlog, 201);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi khi tạo bài viết: ${error.message}`, 500);
  }
});

/**
 * @desc    Cập nhật bài viết theo ID
 * @route   PUT /api/blog/:id
 * @access  Private
 */
export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  try {
    const blogData: BlogRequest = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return sendErrorResponse(res, 'Không tìm thấy bài viết', 404);
    }

    // Chỉ cho phép tác giả hoặc admin cập nhật bài viết
    if (req.user.role !== 'ADMIN' && blog.author && blog.author.toString() !== req.user._id.toString()) {
      return sendErrorResponse(res, 'Không có quyền cập nhật bài viết này', 403);
    }

    // Cập nhật thông tin bài viết
    blog.title = blogData.title || blog.title;
    blog.content = blogData.content || blog.content;
    blog.image = blogData.image !== undefined ? blogData.image : blog.image;
    blog.status = blogData.status || blog.status;
    
    if (blogData.category) {
      blog.category = blogData.category as any; // Ép kiểu sang ObjectId
    }
    
    if (blogData.tags) {
      blog.tags = blogData.tags as any; // Ép kiểu sang mảng ObjectId
    }

    const updatedBlog = await blog.save();

    // Populate thông tin category và author
    const populatedBlog = await Blog.findById(updatedBlog._id)
      .populate<IBlogPopulated>('category', 'name slug')
      .populate<IBlogPopulated>('author', 'username email')
      .populate<IBlogPopulated>('tags', 'name');

    return sendSuccessResponse(res, 'Bài viết được cập nhật thành công', populatedBlog);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi khi cập nhật bài viết: ${error.message}`, 500);
  }
});

/**
 * @desc    Xóa bài viết theo ID
 * @route   DELETE /api/blog/:id
 * @access  Private
 */
export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return sendErrorResponse(res, 'Không tìm thấy bài viết', 404);
    }

    // Chỉ cho phép tác giả hoặc admin xóa bài viết
    if (req.user.role !== 'ADMIN' && blog.author && blog.author.toString() !== req.user._id.toString()) {
      return sendErrorResponse(res, 'Không có quyền xóa bài viết này', 403);
    }

    await blog.deleteOne();
    
    return sendSuccessResponse(res, 'Bài viết đã được xóa thành công');
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi khi xóa bài viết: ${error.message}`, 500);
  }
});

/**
 * @desc    Lấy thông tin bài viết theo ID
 * @route   GET /api/blog/:id
 * @access  Public
 */
export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('author', 'username email')
      .populate('tags', 'name');

    if (!blog) {
      return sendErrorResponse(res, 'Không tìm thấy bài viết', 404);
    }

    return sendSuccessResponse(res, 'Lấy thông tin bài viết thành công', blog);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi khi lấy thông tin bài viết: ${error.message}`, 500);
  }
});

/**
 * @desc    Lấy danh sách tất cả bài viết
 * @route   GET /api/blog
 * @access  Public
 */
export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const search = req.query.search as string;

    // Tạo query dựa trên tham số tìm kiếm
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Đếm tổng số bài viết thỏa mãn điều kiện
    const totalItems = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalItems / size);
    
    // Lấy danh sách bài viết với phân trang và populate các trường liên quan
    const blogs = await Blog.find(query)
      .populate('category', 'name slug')
      .populate('author', 'username email')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    return sendSuccessResponse(
      res, 
      'Lấy danh sách bài viết thành công', 
      blogs,
      200,
      {
        page: page + 1,
        totalPages,
        totalItems
      }
    );
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi khi lấy danh sách bài viết: ${error.message}`, 500);
  }
});

/**
 * @desc    Lấy 4 bài viết mới nhất
 * @route   GET /api/blog/latest
 * @access  Public
 */
export const getTop4LatestBlogs = asyncHandler(async (req: Request, res: Response) => {
  try {
    const latestBlogs = await Blog.find({ status: 'PUBLISHED' })
      .populate('category', 'name slug')
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(4);

    return sendSuccessResponse(
      res, 
      'Lấy 4 bài viết mới nhất thành công', 
      latestBlogs
    );
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi khi lấy bài viết mới nhất: ${error.message}`, 500);
  }
});
