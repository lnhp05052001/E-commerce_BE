import express from 'express';
import * as blogTagController from '../controllers/blogTag.controller';
import { admin, protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blog Tags
 *   description: API endpoints for managing blog tags
 */

/**
 * @swagger
 * /api/blog-tags:
 *   get:
 *     summary: Get all blog tags
 *     description: Retrieve a list of all blog tags with optional search and pagination
 *     tags: [Blog Tags]
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
 *         description: Search by tag name
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 */
router.get('/', blogTagController.getAllTags);

/**
 * @swagger
 * /api/blog-tags/{id}:
 *   get:
 *     summary: Get a tag by ID
 *     description: Retrieve a tag by its unique ID
 *     tags: [Blog Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tag
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag retrieved successfully
 *       404:
 *         description: Tag not found
 */
router.get('/:id', blogTagController.getTagById);

/**
 * @swagger
 * /api/blog-tags/blog/{id}:
 *   get:
 *     summary: Get tags for a blog
 *     description: Retrieve all tags associated with a specific blog
 *     tags: [Blog Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get('/blog/:id', blogTagController.getTagsByBlogId);

/**
 * @swagger
 * /api/blog-tags:
 *   post:
 *     summary: Create a new tag
 *     description: Create a new tag for blogs
 *     tags: [Blog Tags]
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
 *                 example: technology
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Invalid input data or tag already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, admin, blogTagController.createTag);

/**
 * @swagger
 * /api/blog-tags/{id}:
 *   put:
 *     summary: Update a tag
 *     description: Update an existing tag by ID
 *     tags: [Blog Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tag
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
 *                 example: technology updated
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       400:
 *         description: Invalid input data or tag already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
router.put('/:id', protect, admin, blogTagController.updateTag);

/**
 * @swagger
 * /api/blog-tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     description: Delete a tag by ID
 *     tags: [Blog Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tag
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       400:
 *         description: Tag is in use and cannot be deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
router.delete('/:id', protect, admin, blogTagController.deleteTag);

export default router;
