import { OrderStatus } from "../models/order.model";

/**
 * DTO for monthly revenue reports
 */
export interface MonthlyRevenueDTO {
  month: number;
  year: number;
  totalRevenue: number;
  totalDiscountedRevenue: number;
  totalOrders: number;
}

/**
 * DTO for category revenue reports
 */
export interface CategoryRevenueDTO {
  categoryName: string;
  totalRevenue: number;
  totalDiscountedRevenue: number;
  totalOrders: number;
}

/**
 * DTO for order status statistics
 */
export interface OrderStatusDTO {
  status: OrderStatus;
  orderCount: number;
}
