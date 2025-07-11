import express from 'express';
import * as brandController from '../controllers/brand.controller';
import { admin, protect } from '../middleware/auth.middleware';
import { validateBrandRequest } from '../middleware/brand.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/brand:
 *   post:
 *     summary: Create a new brand
 *     description: Create a new brand with the provided details
 *     tags: [Brand]
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
 *                 example: Nike
 *               description:
 *                 type: string
 *                 example: American multinational corporation that is engaged in the design, development, manufacturing, and marketing of footwear, apparel, equipment, accessories, and services.
 *               logo:
 *                 type: string
 *                 example: https://example.com/images/nike-logo.png
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Invalid request or brand already exists
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as admin
 */
router.post('/', protect, admin, validateBrandRequest, brandController.createBrand);

/**
 * @swagger
 * /api/brand/{id}:
 *   put:
 *     summary: Update a brand
 *     description: Update the details of an existing brand by ID
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nike
 *               description:
 *                 type: string
 *                 example: American multinational corporation...
 *               logo:
 *                 type: string
 *                 example: https://example.com/images/nike-logo.png
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Brand not found
 */
router.put('/:id', protect, admin, validateBrandRequest, brandController.updateBrand);

/**
 * @swagger
 * /api/brand/{id}:
 *   delete:
 *     summary: Delete a brand
 *     description: Delete a brand by ID
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       400:
 *         description: Cannot delete brand with associated products
 *       404:
 *         description: Brand not found
 */
router.delete('/:id', protect, admin, brandController.deleteBrand);

/**
 * @swagger
 * /api/brand/{id}:
 *   get:
 *     summary: Get a brand by ID
 *     description: Retrieve a brand by its ID
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand retrieved successfully
 *       404:
 *         description: Brand not found
 */
router.get('/:id', brandController.getBrandById);

/**
 * @swagger
 * /api/brand:
 *   get:
 *     summary: Get all brands
 *     description: Retrieve a list of all brands with optional search and pagination
 *     tags: [Brand]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search brands by name
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 */
router.get('/', brandController.getAllBrands);

/**
 * @swagger
 * /api/brand/top5:
 *   get:
 *     summary: Get top 5 brands
 *     description: Retrieve top 5 brands by product count
 *     tags: [Brand]
 *     responses:
 *       200:
 *         description: Top 5 brands retrieved successfully
 */
router.get('/top5', brandController.getTop5Brands);

export default router;
