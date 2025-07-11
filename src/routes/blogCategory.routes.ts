import express from 'express';
import * as blogCategoryController from '../controllers/blogCategory.controller';
import { admin, protect } from '../middleware/auth.middleware';
import { validateBlogCategoryRequest } from '../middleware/blog.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/blog-category:
 *   post:
 *     summary: Create a new blog category
 *     description: Create a new blog category with the provided details
 *     tags: [Blog Category]
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
 *                 example: Technology
 *               description:
 *                 type: string
 *                 example: Articles about technology
 *     responses:
 *       201:
 *         description: Blog category created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', protect, admin, validateBlogCategoryRequest, blogCategoryController.createBlogCategory);

/**
 * @swagger
 * /api/blog-category/blog-count:
 *   get:
 *     summary: Get blog categories with blog count
 *     description: Retrieve all blog categories with the count of blogs in each category
 *     tags: [Blog Category]
 *     responses:
 *       200:
 *         description: Blog categories with blog count retrieved successfully
 */
router.get('/blog-count', blogCategoryController.getCategoriesWithBlogCount);

/**
 * @swagger
 * /api/blog-category:
 *   get:
 *     summary: Get all blog categories
 *     description: Retrieve all blog categories with pagination and optional name filter
 *     tags: [Blog Category]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Blog category name filter
 *     responses:
 *       200:
 *         description: Blog categories retrieved successfully
 */
router.get('/', blogCategoryController.getAllBlogCategories);

/**
 * @swagger
 * /api/blog-category/{id}:
 *   get:
 *     summary: Get a blog category by ID
 *     description: Retrieve a blog category by its unique ID
 *     tags: [Blog Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog category retrieved successfully
 *       404:
 *         description: Blog category not found
 */
router.get('/:id', blogCategoryController.getBlogCategoryById);

/**
 * @swagger
 * /api/blog-category/{id}:
 *   put:
 *     summary: Update a blog category
 *     description: Update the details of an existing blog category by its ID
 *     tags: [Blog Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog category
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
 *     responses:
 *       200:
 *         description: Blog category updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Blog category not found
 */
router.put('/:id', protect, admin, validateBlogCategoryRequest, blogCategoryController.updateBlogCategory);

/**
 * @swagger
 * /api/blog-category/{id}:
 *   delete:
 *     summary: Delete a blog category
 *     description: Delete a blog category by its unique ID
 *     tags: [Blog Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog category deleted successfully
 *       400:
 *         description: Cannot delete category with associated blogs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Blog category not found
 */
router.delete('/:id', protect, admin, blogCategoryController.deleteBlogCategory);

export default router;
