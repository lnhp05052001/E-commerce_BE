/**
 * @swagger
 * tags:
 *   name: Address
 *   description: API endpoints for address management
 */

import { Router } from 'express';
import {
    createAddress,
    deleteAddress,
    getAddressById,
    getAllAddresses,
    getDefaultAddress,
    toggleDefaultAddress,
    updateAddress
} from '../controllers/address.controller';
import { protect } from '../middleware/auth.middleware';
import { validateAddressRequest } from '../middleware/validation.middleware';

const router = Router();

// Tất cả các API cho địa chỉ đều yêu cầu xác thực
router.use(protect);
router.post('/', validateAddressRequest, createAddress);
 
/**
 * @swagger
 * /api/address/default:
 *   get:
 *     summary: Get the default address for the current user
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Đã lấy địa chỉ mặc định thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     streetAddress:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zipCode:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isDefault:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Default address not found
 *       401:
 *         description: Unauthorized
 */
// API lấy địa chỉ mặc định của người dùng
router.get('/default', getDefaultAddress);

/**
 * @swagger
 * /api/address/{id}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - streetAddress
 *               - city
 *               - state
 *               - zipCode
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
// API cập nhật địa chỉ hiện có
router.put('/:id', validateAddressRequest, updateAddress);

/**
 * @swagger
 * /api/address/{id}/default:
 *   put:
 *     summary: Toggle default address
 *     description: Set the specified address as default and unset others
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Default address toggled successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
// API đặt địa chỉ làm mặc định
router.put('/:id/default', toggleDefaultAddress);

/**
 * @swagger
 * /api/address/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
// API xóa địa chỉ
router.delete('/:id', deleteAddress);

/**
 * @swagger
 * /api/address:
 *   get:
 *     summary: Get all addresses for the current user
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Đã lấy danh sách địa chỉ thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       streetAddress:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       isDefault:
 *                         type: boolean
 *                       user:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
// API lấy tất cả địa chỉ của người dùng
router.get('/', getAllAddresses);

/**
 * @swagger
 * /api/address/{id}:
 *   get:
 *     summary: Get an address by ID
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Đã lấy địa chỉ thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     streetAddress:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zipCode:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isDefault:
 *                       type: boolean
 *                     user:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
// API lấy địa chỉ theo ID
router.get('/:id', getAddressById);

export default router;
