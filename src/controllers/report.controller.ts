import { Request, Response } from 'express';
import reportService from '../services/report.service';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Get monthly revenue data
 * @route   GET /api/reports/revenue
 * @access  Private/Admin
 */
export const getMonthlyRevenue = asyncHandler(async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const data = await reportService.calculateMonthlyRevenue(year);
    return sendSuccessResponse(res, 'Dữ liệu doanh thu theo tháng', data);
  } catch (error) {
    console.error('Error getting monthly revenue:', error);
    return sendErrorResponse(res, 'Đã xảy ra lỗi khi lấy dữ liệu doanh thu', 500);
  }
});

/**
 * @desc    Get revenue data by product category
 * @route   GET /api/reports/category-revenue
 * @access  Private/Admin
 */
export const getCategoryRevenue = asyncHandler(async (req: Request, res: Response) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    
    const data = await reportService.calculateCategoryRevenue(month, year);
    return sendSuccessResponse(res, 'Dữ liệu doanh thu theo danh mục', data);
  } catch (error) {
    console.error('Error getting category revenue:', error);
    return sendErrorResponse(res, 'Đã xảy ra lỗi khi lấy dữ liệu doanh thu theo danh mục', 500);
  }
});

/**
 * @desc    Get order status statistics
 * @route   GET /api/reports/order-status-counts
 * @access  Private/Admin
 */
export const getOrderStatusStatistics = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = await reportService.getOrderStatusStatistics();
    return sendSuccessResponse(res, 'Thống kê trạng thái đơn hàng', data);
  } catch (error) {
    console.error('Error getting order status statistics:', error);
    return sendErrorResponse(res, 'Đã xảy ra lỗi khi lấy thống kê trạng thái đơn hàng', 500);
  }
});
