import { Request, Response } from 'express';
import { ProductRequest } from '../dtos/product.dto';
import Product from '../models/product.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';
import { populateProduct, populateMultipleProducts } from '../utils/populate-helper';
import mongoose from 'mongoose';

/**
 * @desc    Tạo sản phẩm mới
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    const productData: ProductRequest = req.body;
    
    // Tạo sản phẩm mới với tất cả dữ liệu bao gồm mảng URLs hình ảnh
    const product = await Product.create(productData);
    
    // Lấy thông tin sản phẩm đã được populated
    const populatedProduct = await populateProduct(await Product.findById(product._id));
    
    return sendSuccessResponse(res, 'Sản phẩm được tạo thành công', populatedProduct, 201);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return sendErrorResponse(res, error.message, 400);
    }
    return sendErrorResponse(res, 'Không thể tạo sản phẩm', 500);
  }
});

/**
 * @desc    Cập nhật sản phẩm
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const productData: ProductRequest = req.body;
  
  try {
    // Tìm và kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(id);
    if (!product) {
      return sendErrorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }
    
    // Cập nhật thông tin sản phẩm (bao gồm cả mảng URLs hình ảnh)
    const updatedProductDoc = await Product.findByIdAndUpdate(
      id,
      { ...productData },
      { new: true, runValidators: true }
    );
    
    // Lấy thông tin sản phẩm đã được populated
    const updatedProduct = await populateProduct(updatedProductDoc);
    
    return sendSuccessResponse(res, 'Sản phẩm được cập nhật thành công', updatedProduct);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return sendErrorResponse(res, error.message, 400);
    }
    return sendErrorResponse(res, 'Không thể cập nhật sản phẩm', 500);
  }
});

/**
 * @desc    Xóa sản phẩm
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Tìm và kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(id);
    if (!product) {
      return sendErrorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }
    
    // Kiểm tra sản phẩm có đang được đặt hàng không
    // (Trong thực tế, bạn cần kiểm tra nếu sản phẩm có trong đơn hàng nào đó)
    // Đây chỉ là code ví dụ
    
    // Xóa sản phẩm
    await product.deleteOne();
    
    return sendSuccessResponse(res, 'Sản phẩm đã được xóa thành công', null);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể xóa sản phẩm', 500);
  }
});

/**
 * @desc    Lấy thông tin sản phẩm theo ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Sử dụng helper function để populate
    const product = await populateProduct(await Product.findById(id));
    
    if (!product) {
      return sendErrorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }
    
    return sendSuccessResponse(res, 'Lấy thông tin sản phẩm thành công', product);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy thông tin sản phẩm', 500);
  }
});

/**
 * @desc    Lấy danh sách tất cả sản phẩm (có phân trang và lọc) - Tối ưu hiệu suất
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      brandId, 
      categoryId, 
      sortBy = 'createdAt', 
      sortDirection = 'desc',
      search = '',
      isActive
    } = req.query;
    
    // Lấy thông tin phân trang
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const skip = page * size;
    
    // Xây dựng match stage cho aggregation
    const matchStage: any = {};
    const andConditions: any[] = [];
    
    // Lọc theo giá - ưu tiên giá sale nếu có và hợp lệ
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceConditions: any[] = [];
      
      if (minPrice !== undefined && maxPrice !== undefined) {
        priceConditions.push({ 
          isSale: true, 
          salePrice: { $gt: 0, $gte: Number(minPrice), $lte: Number(maxPrice) } 
        });
        priceConditions.push({ 
          $or: [
            { isSale: false },
            { isSale: true, salePrice: { $eq: 0 } }
          ],
          price: { $gte: Number(minPrice), $lte: Number(maxPrice) } 
        });
      } else if (minPrice !== undefined) {
        priceConditions.push({ 
          isSale: true, 
          salePrice: { $gt: 0, $gte: Number(minPrice) } 
        });
        priceConditions.push({ 
          $or: [
            { isSale: false },
            { isSale: true, salePrice: { $eq: 0 } }
          ],
          price: { $gte: Number(minPrice) } 
        });
      } else if (maxPrice !== undefined) {
        priceConditions.push({ 
          isSale: true, 
          salePrice: { $gt: 0, $lte: Number(maxPrice) } 
        });
        priceConditions.push({ 
          $or: [
            { isSale: false },
            { isSale: true, salePrice: { $eq: 0 } }
          ],
          price: { $lte: Number(maxPrice) } 
        });
      }
      
      andConditions.push({ $or: priceConditions });
    }
    
    // Lọc theo thương hiệu
    if (brandId) {
      andConditions.push({ brand: new mongoose.Types.ObjectId(brandId as string) });
    }
    
    // Lọc theo danh mục
    if (categoryId) {
      andConditions.push({ category: new mongoose.Types.ObjectId(categoryId as string) });
    }
    
    // Lọc theo trạng thái hoạt động
    if (isActive !== undefined) {
      andConditions.push({ isActive: isActive === 'true' });
    }
    
    // Tìm kiếm theo tên hoặc mô tả
    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Kết hợp tất cả điều kiện
    if (andConditions.length > 0) {
      matchStage.$and = andConditions;
    }
    
    // Xây dựng aggregation pipeline
    const pipeline: any[] = [];
    
    // Match stage
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Lookup để join với category và brand (thay thế populate)
    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1, slug: 1 } }]
        }
      },
      {
        $lookup: {
          from: "brands", 
          localField: "brand",
          foreignField: "_id",
          as: "brand",
          pipeline: [{ $project: { name: 1, logo: 1, slug: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
          brand: { $arrayElemAt: ["$brand", 0] },
          actualPrice: {
            $cond: {
              if: { $and: ["$isSale", { $gt: ["$salePrice", 0] }] },
              then: "$salePrice", 
              else: "$price"
            }
          }
        }
      }
    );
    
    // Đếm tổng số documents trước khi phân trang
    const countPipeline = [...pipeline, { $count: "totalCount" }];
    const countResult = await Product.aggregate(countPipeline);
    const totalItems = countResult[0]?.totalCount || 0;
    
    // Thêm sort stage
    if (sortBy === 'price') {
      pipeline.push({ 
        $sort: { actualPrice: sortDirection === 'asc' ? 1 : -1 } 
      });
    } else if (sortBy === 'name') {
      // Sắp xếp theo tên sản phẩm
      pipeline.push({ 
        $sort: { name: sortDirection === 'asc' ? 1 : -1 } 
      });
    } else {
      // Sắp xếp theo các field khác (createdAt, etc.)
      const sortField = sortBy as string;
      pipeline.push({ 
        $sort: { [sortField]: sortDirection === 'asc' ? 1 : -1 } 
      });
    }
    
    // Phân trang
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: size });
    
    // Thực hiện aggregation với collation cho tiếng Việt (nếu sort by name)
    let products;
    if (sortBy === 'name') {
      products = await Product.aggregate(pipeline, {
        collation: {
          locale: 'vi',
          strength: 2,
          caseLevel: false,
          numericOrdering: true
        }
      });
    } else {
      products = await Product.aggregate(pipeline);
    }
    
    // Tạo thông tin phân trang
    const pagination = {
      page: page + 1,
      totalPages: Math.ceil(totalItems / size),
      totalItems
    };
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm thành công', products, 200, pagination);
  } catch (error) {
    console.error('=== getAllProducts Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', (error as Error).stack);
    console.error('============================');
    return sendErrorResponse(res, 'Không thể lấy danh sách sản phẩm: ' + (error as Error).message, 500);
  }
});

/**
 * @desc    Lấy danh sách sản phẩm mới nhất
 * @route   GET /api/products/new-arrivals
 * @access  Public
 */
export const getNewArrivals = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Sử dụng aggregation pipeline với lookup để tối ưu hiệu suất
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1, slug: 1 } }]
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand", 
          foreignField: "_id",
          as: "brand",
          pipeline: [{ $project: { name: 1, logo: 1, slug: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
          brand: { $arrayElemAt: ["$brand", 0] }
        }
      }
    ]);
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm mới thành công', products);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy danh sách sản phẩm mới', 500);
  }
});

/**
 * @desc    Lấy danh sách sản phẩm bán chạy nhất
 * @route   GET /api/products/top-selling
 * @access  Public
 */
export const getTopSellingProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Sử dụng aggregation pipeline với lookup để tối ưu hiệu suất
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 5 } }, // Random sampling for demo
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id", 
          as: "category",
          pipeline: [{ $project: { name: 1, slug: 1 } }]
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand", 
          pipeline: [{ $project: { name: 1, logo: 1, slug: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
          brand: { $arrayElemAt: ["$brand", 0] }
        }
      }
    ]);
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm bán chạy thành công', products);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy danh sách sản phẩm bán chạy', 500);
  }
});

/**
 * @desc    Lấy danh sách sản phẩm giảm giá nhiều nhất
 * @route   GET /api/products/top-discounted
 * @access  Public
 */
export const getTopDiscountedProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Sử dụng aggregation pipeline với lookup để tối ưu hiệu suất
    const products = await Product.aggregate([
      {
        $match: { 
          isActive: true,
          isSale: true,
          salePrice: { $gt: 0 },
          price: { $gt: 0 }
        }
      },
      {
        $addFields: {
          discountAmount: { $subtract: ["$price", "$salePrice"] },
          discountPercentage: {
            $multiply: [
              { $divide: [{ $subtract: ["$price", "$salePrice"] }, "$price"] },
              100
            ]
          }
        }
      },
      { $sort: { discountPercentage: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1, slug: 1 } }]
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id", 
          as: "brand",
          pipeline: [{ $project: { name: 1, logo: 1, slug: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
          brand: { $arrayElemAt: ["$brand", 0] }
        }
      }
    ]);
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm giảm giá thành công', products);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy danh sách sản phẩm giảm giá', 500);
  }
});

/**
 * @desc    Tìm kiếm sản phẩm theo từ khóa
 * @route   GET /api/products/search
 * @access  Public
 */
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { keyword } = req.query;
  
  try {
    if (!keyword) {
      return sendErrorResponse(res, 'Từ khóa tìm kiếm là bắt buộc', 400);
    }
    
    // Sử dụng aggregation pipeline với lookup để tối ưu hiệu suất
    const products = await Product.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
          ]
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1, slug: 1 } }]
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
          pipeline: [{ $project: { name: 1, logo: 1, slug: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
          brand: { $arrayElemAt: ["$brand", 0] }
        }
      }
    ]);
    
    return sendSuccessResponse(res, 'Tìm kiếm sản phẩm thành công', products);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể tìm kiếm sản phẩm', 500);
  }
});

/**
 * @desc    Lấy sản phẩm theo giới tính
 * @route   GET /api/products/by-gender/:gender
 * @access  Public
 */
export const getProductsByGender = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { gender } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const skip = page * size;
    
    // Validate gender
    const validGenders = ['Men', 'Women', 'Unisex', 'Children'];
    if (!validGenders.includes(gender)) {
      return sendErrorResponse(res, 'Giới tính không hợp lệ', 400);
    }
    
    const matchStage = { 
      gender, 
      isActive: true 
    };
    
    // Đếm tổng số documents
    const totalItems = await Product.countDocuments(matchStage);
    const totalPages = Math.ceil(totalItems / size);
    
    // Sử dụng aggregation pipeline với lookup để tối ưu hiệu suất
    const products = await Product.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: size },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1 } }]
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
          pipeline: [{ $project: { name: 1, logo: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
          brand: { $arrayElemAt: ["$brand", 0] }
        }
      }
    ]);
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm theo giới tính thành công', {
      products,
      pagination: {
        page: page + 1,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy danh sách sản phẩm', 500);
  }
});

/**
 * @desc    Lấy sản phẩm theo kích thước
 * @route   GET /api/products/by-size/:size
 * @access  Public
 */
export const getProductsBySize = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { size: productSize } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const skip = page * size;
    
    const matchStage = { 
      sizes: { $in: [productSize] }, 
      isActive: true 
    };
    
    // Đếm tổng số documents
    const totalItems = await Product.countDocuments(matchStage);
    const totalPages = Math.ceil(totalItems / size);
    
    // Sử dụng aggregation pipeline với lookup để tối ưu hiệu suất
    const products = await Product.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: size },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1 } }]
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
          pipeline: [{ $project: { name: 1, logo: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$category", 0] },
          brand: { $arrayElemAt: ["$brand", 0] }
        }
      }
    ]);
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm theo kích thước thành công', {
      products,
      pagination: {
        page: page + 1,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy danh sách sản phẩm', 500);
  }
});

/**
 * @desc    Lấy danh sách màu sắc hiện có
 * @route   GET /api/products/colors
 * @access  Public
 */
export const getAvailableColors = asyncHandler(async (req: Request, res: Response) => {
  try {
    const colors = await Product.distinct('colors');
    
    return sendSuccessResponse(res, 'Lấy danh sách màu sắc thành công', colors);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy danh sách màu sắc', 500);
  }
});

/**
 * @desc    Lấy danh sách kích thước hiện có
 * @route   GET /api/products/sizes
 * @access  Public
 */
export const getAvailableSizes = asyncHandler(async (req: Request, res: Response) => {
  try {
    const sizes = await Product.distinct('sizes');
    
    return sendSuccessResponse(res, 'Lấy danh sách kích thước thành công', sizes);
  } catch (error) {
    return sendErrorResponse(res, 'Không thể lấy danh sách kích thước', 500);
  }
});

/**
 * @desc    Lấy thông tin biến thể sản phẩm (size, màu sắc)
 * @route   GET /api/products/:id/variants
 * @access  Public
 */
export const getProductVariants = asyncHandler(async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return sendErrorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }

    const variants = {
      productId: product._id,
      name: product.name,
      basePrice: product.price,
      salePrice: product.salePrice,
      isSale: product.isSale,
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock: product.stock,
      // Có thể mở rộng để tính stock cho từng combination của size/color
      combinations: product.sizes && product.colors ? 
        product.sizes.flatMap(size => 
          product.colors!.map(color => ({
            size,
            color,
            available: product.stock > 0, // Simplified, có thể phức tạp hơn
            price: product.isSale ? product.salePrice : product.price
          }))
        ) : []
    };

    return sendSuccessResponse(res, 'Lấy thông tin biến thể sản phẩm thành công', variants);
  } catch (error: any) {
    return sendErrorResponse(res, `Lỗi khi lấy thông tin biến thể: ${error.message}`, 500);
  }
});
