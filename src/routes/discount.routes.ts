import express from 'express';
import {
    applyDiscount,
    createDiscount,
    deleteDiscount,
    getAllDiscounts,
    getDiscountById,
    searchDiscounts,
    updateDiscount
} from '../controllers/discount.controller';
import { admin, protect } from '../middleware/auth.middleware';

const router = express.Router();

// Admin routes
router.post('/', protect, admin, createDiscount);
router.get('/', protect, admin, getAllDiscounts);
router.get('/search', protect, admin, searchDiscounts);
router.get('/:id', protect, admin, getDiscountById);
router.put('/:id', protect, admin, updateDiscount);
router.delete('/:id', protect, admin, deleteDiscount);

// User routes
router.post('/apply', protect, applyDiscount);

export default router;
