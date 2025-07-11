import express from 'express';
import * as blogController from '../controllers/blog.controller';
import { protect } from '../middleware/auth.middleware';
import { validateBlogRequest } from '../middleware/blog.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create a new blog
 *     description: Create a new blog with the provided details
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: How to use Node.js
 *               content:
 *                 type: string
 *                 example: This is a blog about Node.js
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, HIDDEN]
 *                 default: DRAFT
 *               category:
 *                 type: string
 *                 example: 60d5e50a9c1b8d2c240c9999
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5e50a9c1b8d2c240c9998", "60d5e50a9c1b8d2c240c9997"]
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, validateBlogRequest, blogController.createBlog);

/**
 * @swagger
 * /api/blog/latest:
 *   get:
 *     summary: Get top 4 latest blogs
 *     description: Retrieve the top 4 latest published blogs
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Top 4 latest blogs retrieved successfully
 */
router.get('/latest', blogController.getTop4LatestBlogs);

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve a list of all blogs with optional search by title and pagination
 *     tags: [Blog]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or content
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
router.get('/', blogController.getAllBlogs);

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Get blog by ID
 *     description: Retrieve a blog by its ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get('/:id', blogController.getBlogById);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Update an existing blog
 *     description: Update the details of an existing blog by ID
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, HIDDEN]
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the author or admin
 *       404:
 *         description: Blog not found
 */
router.put('/:id', protect, validateBlogRequest, blogController.updateBlog);

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete a blog
 *     description: Delete a blog by ID
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the author or admin
 *       404:
 *         description: Blog not found
 */
router.delete('/:id', protect, blogController.deleteBlog);

export default router;
