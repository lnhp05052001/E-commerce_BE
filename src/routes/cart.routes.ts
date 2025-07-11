import { Router } from 'express';
import {
    addToCart,
    clearCart,
    getCart,
    removeCartItem,
    updateCartItemQuantity
} from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validateCartAddItemRequest, validateCartUpdateRequest } from '../middleware/cart.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for shopping cart management
 */

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add product to cart
 *     description: Add a product with selected size and color to the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "60d9b4f18f33a22e7c9f1234"
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 2
 *               selectedSize:
 *                 type: string
 *                 example: "M"
 *               selectedColor:
 *                 type: string
 *                 example: "Đen"
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       400:
 *         description: Invalid input data or size/color not available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/add', protect, validateCartAddItemRequest, addToCart);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a product in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: ID of the cart item to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Invalid quantity
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your cart item
 *       404:
 *         description: Cart item not found
 */
router.put('/:itemId', protect, validateCartUpdateRequest, updateCartItemQuantity);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: ID of the cart item to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.delete('/:itemId', protect, removeCartItem);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     description: Remove all items from the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 */
router.delete('/clear', protect, clearCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the current user's shopping cart with all items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   example: "Lấy thông tin giỏ hàng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           product:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               productImages:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               sizes:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               colors:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                           selectedSize:
 *                             type: string
 *                           selectedColor:
 *                             type: string
 *                     totalPrice:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getCart);

export default router;
