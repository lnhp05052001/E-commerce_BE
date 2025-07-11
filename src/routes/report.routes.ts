import { Router } from 'express';
import { getCategoryRevenue, getMonthlyRevenue, getOrderStatusStatistics } from '../controllers/report.controller';
import { admin, protect } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/reports/revenue
 * @desc    Get monthly revenue data
 * @access  Private/Admin
 */
router.get('/revenue', protect, admin, getMonthlyRevenue);

/**
 * @route   GET /api/reports/category-revenue
 * @desc    Get revenue data by product category
 * @access  Private/Admin
 */
router.get('/category-revenue', protect, admin, getCategoryRevenue);

/**
 * @route   GET /api/reports/order-status-counts
 * @desc    Get order status statistics
 * @access  Private/Admin
 */
router.get('/order-status-counts', protect, admin, getOrderStatusStatistics);

export default router;
