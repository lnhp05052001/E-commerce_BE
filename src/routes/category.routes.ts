import express from 'express';
import * as categoryController from '../controllers/category.controller';
import { admin, protect } from '../middleware/auth.middleware';
import { validateCategoryRequest } from '../middleware/category.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Create a new category
 *     description: Create a new product category with the provided details
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Electronic products and gadgets
 *               image:
 *                 type: string
 *                 example: https://example.com/images/electronics.jpg
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', protect, admin, validateCategoryRequest, categoryController.createCategory);

/**
 * @swagger
 * /api/category/product-count:
 *   get:
 *     summary: Get categories with product count
 *     description: Retrieve all categories with the count of products in each category
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Categories with product count retrieved successfully
 */
router.get('/product-count', categoryController.getCategoriesWithProductCount);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Get a category by ID
 *     description: Retrieve details of a specific category by its ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the category to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update a category
 *     description: Update an existing category with new information
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the category to update
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
 *                 example: Updated Electronics
 *               description:
 *                 type: string
 *                 example: Updated description for electronics
 *               image:
 *                 type: string
 *                 example: https://example.com/images/electronics-updated.jpg
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category
 *     description: Delete a category by ID
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the category to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with linked products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Category not found
 */
router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(protect, admin, validateCategoryRequest, categoryController.updateCategory)
  .delete(protect, admin, categoryController.deleteCategory);

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all categories with optional search and pagination
 *     tags: [Category]
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter categories by name
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/', categoryController.getAllCategories);

export default router;
