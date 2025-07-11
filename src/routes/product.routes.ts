import express from 'express';
import * as productController from '../controllers/product.controller';
import { admin, protect } from '../middleware/auth.middleware';
import { validateProductRequest } from '../middleware/product.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API endpoints for clothing product management
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new clothing product
 *     description: Create a new clothing product with the provided details
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Áo thun nam trơn"
 *               description:
 *                 type: string
 *                 example: "Áo thun nam chất liệu cotton cao cấp, thoáng mát"
 *               price:
 *                 type: number
 *                 example: 199000
 *               salePrice:
 *                 type: number
 *                 example: 149000
 *               isSale:
 *                 type: boolean
 *                 example: true
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["S", "M", "L", "XL"]
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Đen", "Trắng", "Xanh navy"]
 *               material:
 *                 type: string
 *                 example: "Cotton 100%"
 *               gender:
 *                 type: string
 *                 enum: [Men, Women, Unisex, Children]
 *                 example: "Men"
 *               style:
 *                 type: string
 *                 example: "Casual"
 *               season:
 *                 type: string
 *                 example: "All-season"
 *               category:
 *                 type: string
 *                 example: "60d9b4f18f33a22e7c9f1234"
 *               brand:
 *                 type: string
 *                 example: "60d9b4f18f33a22e7c9f5678"
 *               stock:
 *                 type: number
 *                 example: 100
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/images/ao-thun-1.jpg", "https://example.com/images/ao-thun-2.jpg"]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/',
  protect,
  admin,
  validateProductRequest,
  productController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a clothing product
 *     description: Update an existing clothing product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               isSale:
 *                 type: boolean
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: string
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *               material:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Men, Women, Unisex, Children]
 *               style:
 *                 type: string
 *               season:
 *                 type: string
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               stock:
 *                 type: number
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 */
router.put(
  '/:id',
  protect,
  admin,
  validateProductRequest,
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 */
router.delete('/:id', protect, admin, productController.deleteProduct);

/**
 * @swagger
 * /api/products/new-arrivals:
 *   get:
 *     summary: Get new arrivals
 *     description: Retrieve the latest 10 clothing products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Men, Women, Unisex, Children]
 *         description: Filter by gender
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: New arrivals retrieved successfully
 */
router.get('/new-arrivals', productController.getNewArrivals);

/**
 * @swagger
 * /api/products/top-selling:
 *   get:
 *     summary: Get top-selling products
 *     description: Retrieve the top 5 best-selling products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Top selling products retrieved successfully
 */
router.get('/top-selling', productController.getTopSellingProducts);

/**
 * @swagger
 * /api/products/top-discounted:
 *   get:
 *     summary: Get top discounted products
 *     description: Retrieve the top 10 products with the highest discounts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Top discounted products retrieved successfully
 */
router.get('/top-discounted', productController.getTopDiscountedProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     description: Search products by name or description
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Products search results
 *       400:
 *         description: Invalid input - missing keyword
 */
router.get('/search', productController.searchProducts);

/**
 * @swagger
 * /api/products/by-gender/{gender}:
 *   get:
 *     summary: Get products by gender
 *     description: Retrieve clothing products filtered by gender with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: gender
 *         required: true
 *         description: Gender to filter by (Men, Women, Unisex, Children)
 *         schema:
 *           type: string
 *           enum: [Men, Women, Unisex, Children]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid gender parameter
 */
router.get('/by-gender/:gender', productController.getProductsByGender);

/**
 * @swagger
 * /api/products/by-size/{size}:
 *   get:
 *     summary: Get products by size
 *     description: Retrieve clothing products filtered by size with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: size
 *         required: true
 *         description: Size to filter by (XS, S, M, L, XL, etc.)
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/by-size/:size', productController.getProductsBySize);

/**
 * @swagger
 * /api/products/colors:
 *   get:
 *     summary: Get all available colors
 *     description: Retrieve a list of all available colors for clothing products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Colors retrieved successfully
 */
router.get('/colors', productController.getAvailableColors);

/**
 * @swagger
 * /api/products/sizes:
 *   get:
 *     summary: Get all available sizes
 *     description: Retrieve a list of all available sizes for clothing products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Sizes retrieved successfully
 */
router.get('/sizes', productController.getAvailableSizes);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a product by its ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/products/{id}/variants:
 *   get:
 *     summary: Get product variants
 *     description: Get available sizes, colors and their combinations for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product variants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy thông tin biến thể sản phẩm thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     basePrice:
 *                       type: number
 *                     salePrice:
 *                       type: number
 *                     isSale:
 *                       type: boolean
 *                     sizes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["S", "M", "L", "XL"]
 *                     colors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Đen", "Trắng", "Xanh navy"]
 *                     stock:
 *                       type: number
 *                     combinations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           size:
 *                             type: string
 *                           color:
 *                             type: string
 *                           available:
 *                             type: boolean
 *                           price:
 *                             type: number
 *       404:
 *         description: Product not found
 */
router.get('/:id/variants', productController.getProductVariants);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all clothing products
 *     description: Retrieve all clothing products with optional filtering, sorting, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Men, Women, Unisex, Children]
 *         description: Filter by gender
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Filter by size
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by color
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *         description: Filter by material
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *         description: Maximum price filter
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /api/products/by-gender/{gender}:
 *   get:
 *     summary: Get products by gender
 *     description: Retrieve clothing products filtered by gender with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: gender
 *         required: true
 *         description: Gender to filter by (Men, Women, Unisex, Children)
 *         schema:
 *           type: string
 *           enum: [Men, Women, Unisex, Children]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid gender parameter
 */
router.get('/by-gender/:gender', productController.getProductsByGender);

/**
 * @swagger
 * /api/products/by-size/{size}:
 *   get:
 *     summary: Get products by size
 *     description: Retrieve clothing products filtered by size with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: size
 *         required: true
 *         description: Size to filter by (XS, S, M, L, XL, etc.)
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/by-size/:size', productController.getProductsBySize);

/**
 * @swagger
 * /api/products/colors:
 *   get:
 *     summary: Get all available colors
 *     description: Retrieve a list of all available colors for clothing products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Colors retrieved successfully
 */
router.get('/colors', productController.getAvailableColors);

/**
 * @swagger
 * /api/products/sizes:
 *   get:
 *     summary: Get all available sizes
 *     description: Retrieve a list of all available sizes for clothing products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Sizes retrieved successfully
 */
router.get('/sizes', productController.getAvailableSizes);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all clothing products
 *     description: Retrieve all clothing products with optional filtering, sorting, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Men, Women, Unisex, Children]
 *         description: Filter by gender
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Filter by size
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by color
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *         description: Filter by material
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *         description: Maximum price filter
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', productController.getAllProducts);

export default router;
