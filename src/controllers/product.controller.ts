import { Request, Response } from 'express';
import { ProductRequest } from '../dtos/product.dto';
import Product from '../models/product.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';
import { populateProduct } from '../utils/populate-helper';

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
    console.log(error);
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
    console.log(productData)
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
 * @desc    Lấy danh sách tất cả sản phẩm (có phân trang và lọc)
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
    
    // Xây dựng điều kiện lọc
    const filter: any = {};
    
    // Tạo array để chứa các điều kiện $and
    const andConditions: any[] = [];
    
    // Lọc theo giá - ưu tiên giá sale nếu có
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceConditions: any[] = [];
      
      if (minPrice !== undefined && maxPrice !== undefined) {
        // Sản phẩm có sale: lọc theo salePrice
        priceConditions.push({ 
          isSale: true, 
          salePrice: { $gte: Number(minPrice), $lte: Number(maxPrice) } 
        });
        // Sản phẩm không sale: lọc theo price
        priceConditions.push({ 
          isSale: false, 
          price: { $gte: Number(minPrice), $lte: Number(maxPrice) } 
        });
      } else if (minPrice !== undefined) {
        // Sản phẩm có sale: lọc theo salePrice
        priceConditions.push({ 
          isSale: true, 
          salePrice: { $gte: Number(minPrice) } 
        });
        // Sản phẩm không sale: lọc theo price
        priceConditions.push({ 
          isSale: false, 
          price: { $gte: Number(minPrice) } 
        });
      } else if (maxPrice !== undefined) {
        // Sản phẩm có sale: lọc theo salePrice
        priceConditions.push({ 
          isSale: true, 
          salePrice: { $lte: Number(maxPrice) } 
        });
        // Sản phẩm không sale: lọc theo price
        priceConditions.push({ 
          isSale: false, 
          price: { $lte: Number(maxPrice) } 
        });
      }
      
      andConditions.push({ $or: priceConditions });
    }
    
    // Lọc theo thương hiệu
    if (brandId) {
      andConditions.push({ brand: brandId });
    }
    
    // Lọc theo danh mục
    if (categoryId) {
      andConditions.push({ category: categoryId });
    }
    
    // Lọc theo trạng thái hoạt động - chỉ thêm vào filter nếu được chỉ định
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
      filter.$and = andConditions;
    }
    
    // Xác định hướng sắp xếp
    const sort: any = {};
    
    // Lấy thông tin phân trang
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const skip = page * size;
    
    // Nếu sắp xếp theo giá, sử dụng giá thực tế (ưu tiên sale price)
    if (sortBy === 'price') {
      // Sắp xếp bằng aggregation để tính giá thực tế
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      // Tạo pipeline aggregate để tính giá thực tế và sắp xếp
      const pipeline: any[] = [];
      
      // Match với filter
      if (Object.keys(filter).length > 0) {
        pipeline.push({ $match: filter });
      }
      
      // Thêm field actualPrice để sort
      pipeline.push({
        $addFields: {
          actualPrice: {
            $cond: {
              if: "$isSale",
              then: "$salePrice", 
              else: "$price"
            }
          }
        }
      });
      
      // Sort theo actualPrice
      pipeline.push({ $sort: { actualPrice: direction } });
      
      // Đếm tổng số documents
      const totalItems = await Product.countDocuments(filter);
      
      // Thêm skip và limit
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: size });
      
      // Thực hiện aggregation
      const productDocs = await Product.aggregate(pipeline);
      
      // Convert về model instances và populate
      const products = await Promise.all(
        productDocs.map(async (doc) => {
          const product = await Product.findById(doc._id);
          return await populateProduct(product);
        })
      );
      
      // Tạo thông tin phân trang
      const pagination = {
        page: page + 1,
        totalPages: Math.ceil(totalItems / size),
        totalItems
      };
      
      return sendSuccessResponse(res, 'Lấy danh sách sản phẩm thành công', products, 200, pagination);
    }
    
    // Nếu sắp xếp theo tên, sử dụng collation để sort đúng tiếng Việt
    if (sortBy === 'name') {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      // Đếm tổng số documents
      const totalItems = await Product.countDocuments(filter);
      
      // Query với collation để sort tiếng Việt đúng
      const productDocs = await Product.find(filter)
        .collation({ 
          locale: 'vi', 
          strength: 2, // Ignore case và diacritics
          caseLevel: false,
          numericOrdering: true 
        })
        .sort({ name: direction })
        .skip(skip)
        .limit(size);
      
      // Sử dụng helper để populate
      const products = await Promise.all(
        productDocs.map(product => populateProduct(product))
      );
      
      // Tạo thông tin phân trang
      const pagination = {
        page: page + 1,
        totalPages: Math.ceil(totalItems / size),
        totalItems
      };
      
      return sendSuccessResponse(res, 'Lấy danh sách sản phẩm thành công', products, 200, pagination);
    }
    
    // Sắp xếp thông thường cho các field khác
    sort[sortBy as string] = sortDirection === 'asc' ? 1 : -1;
    
    // Thực hiện truy vấn cho các field khác
    const totalItems = await Product.countDocuments(filter);
    const productDocs = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size);
    
    // Sử dụng helper để populate
    const products = await Promise.all(
      productDocs.map(product => populateProduct(product))
    );
    
    // Tạo thông tin phân trang
    const pagination = {
      page: page + 1,
      totalPages: Math.ceil(totalItems / size),
      totalItems
    };
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm thành công', products, 200, pagination);
  } catch (error) {

    return sendErrorResponse(res, 'Không thể lấy danh sách sản phẩm' + error, 500);
  }
});

/**
 * @desc    Lấy danh sách sản phẩm mới nhất
 * @route   GET /api/products/new-arrivals
 * @access  Public
 */
export const getNewArrivals = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Tìm sản phẩm mới nhất trước
    const productDocs = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Populate từng sản phẩm
    const populatedProducts = await Promise.all(
      productDocs.map(product => populateProduct(product))
    );
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm mới thành công', populatedProducts);
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
    // Trong thực tế, bạn cần có logic để tính toán sản phẩm bán chạy
    // Đây chỉ là code ví dụ, lấy 5 sản phẩm ngẫu nhiên
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 5 } }
    ]);
    
    // Chuyển đổi các document từ aggregate sang model đầy đủ
    const productDocs = await Promise.all(
      products.map(product => Product.findById(product._id))
    );
    
    // Sử dụng helper để populate
    const populatedProducts = await Promise.all(
      productDocs.map(product => populateProduct(product))
    );
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm bán chạy thành công', populatedProducts);
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
    // Sử dụng aggregation để tính mức giảm giá và sắp xếp
    const products = await Product.aggregate([
      {
        $match: { 
          isActive: true,
          isSale: true,
          salePrice: { $gt: 0 },
          price: { $gt: 0 } // Đảm bảo price > 0 để tránh chia cho 0
        }
      },
      {
        $addFields: {
          discountAmount: { $subtract: ["$price", "$salePrice"] }, // Số tiền giảm
          discountPercentage: { // Phần trăm giảm giá
            $multiply: [
              { $divide: [{ $subtract: ["$price", "$salePrice"] }, "$price"] },
              100
            ]
          }
        }
      },
      {
        $sort: { discountPercentage: -1 } // Sắp xếp theo % giảm giá từ cao đến thấp
      },
      {
        $limit: 10
      }
    ]);
    
    // Chuyển đổi các document từ aggregate sang model đầy đủ và populate
    const productDocs = await Promise.all(
      products.map(product => Product.findById(product._id))
    );
    
    // Sử dụng helper để populate
    const populatedProducts = await Promise.all(
      productDocs.map(product => populateProduct(product))
    );
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm giảm giá thành công', populatedProducts);
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
    
    const productDocs = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    });
    
    // Sử dụng helper để populate
    const populatedProducts = await Promise.all(
      productDocs.map(product => populateProduct(product))
    );
    
    return sendSuccessResponse(res, 'Tìm kiếm sản phẩm thành công', populatedProducts);
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
    
    // Validate gender
    const validGenders = ['Men', 'Women', 'Unisex', 'Children'];
    if (!validGenders.includes(gender)) {
      return sendErrorResponse(res, 'Giới tính không hợp lệ', 400);
    }
    
    const query = { 
      gender, 
      isActive: true 
    };
    
    const totalItems = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalItems / size);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .populate('category', 'name')
      .populate('brand', 'name logo')
      .populate({
        path: 'productImages',
        options: { limit: 1 }, // Chỉ lấy 1 hình ảnh đại diện
      });
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm theo giới tính thành công', {
      products,
      pagination: {
        page,
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
    
    const query = { 
      sizes: { $in: [productSize] }, 
      isActive: true 
    };
    
    const totalItems = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalItems / size);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .populate('category', 'name')
      .populate('brand', 'name logo')
      .populate({
        path: 'productImages',
        options: { limit: 1 }, // Chỉ lấy 1 hình ảnh đại diện
      });
    
    return sendSuccessResponse(res, 'Lấy danh sách sản phẩm theo kích thước thành công', {
      products,
      pagination: {
        page,
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
