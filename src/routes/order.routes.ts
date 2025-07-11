import express from 'express';
import * as orderController from '../controllers/order.controller';
import { admin, protect } from '../middleware/auth.middleware';
import { validateOrderRequest, validateOrderStatusUpdate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with the provided details including size and color selections
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItems
 *               - paymentMethod
 *               - totalAmount
 *               - finalAmount
 *               - address
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product
 *                     - name
 *                     - quantity
 *                     - price
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "Áo thun nam trơn"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 199000
 *                     image:
 *                       type: string
 *                       example: "https://example.com/images/ao-thun.jpg"
 *                     selectedSize:
 *                       type: string
 *                       example: "M"
 *                     selectedColor:
 *                       type: string
 *                       example: "Đen"
 *               paymentMethod:
 *                 type: string
 *                 example: "COD"
 *               totalAmount:
 *                 type: number
 *                 example: 398000
 *               discountAmount:
 *                 type: number
 *                 example: 0
 *               finalAmount:
 *                 type: number
 *                 example: 398000
 *               address:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c90"
 *               discountCode:
 *                 type: string
 *                 example: "SALE20"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data or size/color not available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/', protect, validateOrderRequest, orderController.createOrder);
/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     summary: Get user's orders
 *     description: Retrieve all orders for the currently authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/user', protect, orderController.getUserOrders);
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve an order by its unique ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Order belongs to another user
 */
router.get('/:id', protect, orderController.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Admin)
 *     description: Retrieve all orders with pagination and filtering options
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', protect, admin, orderController.getAllOrders);



/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin)
 *     description: Change the status of an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *                 example: PROCESSING
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid order status
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/:id/status', protect,   validateOrderStatusUpdate, orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order (Admin)
 *     description: Delete an order and its associated order items
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete('/:id', protect, admin, orderController.deleteOrder);

/**
 * @swagger
 * /api/orders/search:
 *   get:
 *     summary: Search orders by order ID (Admin)
 *     description: Search for orders by their friendly order ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID to search for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The page number (zero-based)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page
 *     responses:
 *       200:
 *         description: Orders found successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/search', protect, admin, orderController.searchOrdersByOrderId);

/**
 * @swagger
 * /api/orders/{id}/download-pdf:
 *   get:
 *     summary: Download order as PDF
 *     description: Generate and download a PDF file with order details
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Order belongs to another user
 */
router.get('/:id/download-pdf', protect, orderController.generateOrderPdf);

/**
 * @swagger
 * /api/orders/{id}/send-email:
 *   post:
 *     summary: Send order details by email
 *     description: Send the order details to the specified email address
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Invalid email address
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/send-email', protect, orderController.sendOrderEmail);

export default router;
