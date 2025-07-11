/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: API endpoints for contact management
 */

import { Router } from 'express';
import {
    createContact,
    deleteContact,
    getAllContacts,
    getContactById,
    markAsResponded,
    updateContact
} from '../controllers/contact.controller';
import { admin, protect } from '../middleware/auth.middleware';
import { validateContactRequest } from '../middleware/contact.middleware';

const router = Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Create a new contact
 *     description: Send a new contact message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: example@email.com
 *               message:
 *                 type: string
 *                 example: Tôi có câu hỏi về sản phẩm của bạn
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', validateContactRequest, createContact);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contacts
 *     description: Retrieve a list of all contacts with optional search and pagination
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
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
 *         description: Search term to filter contacts by name or email
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', protect, admin, getAllContacts);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get a contact by ID
 *     description: Retrieve a contact by its ID
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the contact
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Contact not found
 *   put:
 *     summary: Update a contact
 *     description: Update a contact by ID
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the contact to update
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
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [NEW, READ, RESPONDED]
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Contact not found
 *   delete:
 *     summary: Delete a contact
 *     description: Delete a contact by ID
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the contact to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Contact not found
 */
router.route('/:id')
  .get(protect, admin, getContactById)
  .put(protect, admin, updateContact)
  .delete(protect, admin, deleteContact);

/**
 * @swagger
 * /api/contact/{id}/respond:
 *   put:
 *     summary: Mark a contact as responded
 *     description: Update a contact status to RESPONDED
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the contact to mark as responded
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact marked as responded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Contact not found
 */
router.put('/:id/respond', protect, admin, markAsResponded);

export default router;
