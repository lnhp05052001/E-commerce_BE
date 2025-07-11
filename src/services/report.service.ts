import { CategoryRevenueDTO, MonthlyRevenueDTO, OrderStatusDTO } from "../dtos/report.dto";
import Order, { OrderItem, OrderStatus } from "../models/order.model";

/**
 * Service for generating various reports related to orders and revenue
 */
export class ReportService {
  /**
   * Calculate monthly revenue for a specific year or all time
   * @param year Optional year to filter results
   * @returns Array of monthly revenue data
   */  async calculateMonthlyRevenue(year?: number): Promise<MonthlyRevenueDTO[]> {
    let matchStage: any = { status: OrderStatus.DELIVERED };
    
    if (year) {
      // Add year filter if provided
      matchStage = {
        ...matchStage,
        orderDate: {
          $gte: new Date(`${year}-01-01`).toISOString(),
          $lte: new Date(`${year}-12-31`).toISOString()
        }
      };
    }
    
    const results = await Order.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          // Parse orderDate string to Date object for aggregation
          orderDateObj: { $dateFromString: { dateString: "$orderDate" } }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$orderDateObj" },
            year: { $year: "$orderDateObj" }
          },
          totalRevenue: { $sum: "$totalAmount" },
          totalDiscountedRevenue: { $sum: "$finalAmount" },
          totalOrders: { $count: {} }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          totalRevenue: 1,
          totalDiscountedRevenue: 1,
          totalOrders: 1
        }
      },
      { $sort: { year: -1, month: -1 } }
    ]);

    // If a specific year was requested, ensure all months are included
    if (year) {
      const revenueMap = new Map<number, MonthlyRevenueDTO>();
      
      // Initialize all months with zero values
      for (let i = 1; i <= 12; i++) {
        revenueMap.set(i, {
          month: i,
          year,
          totalRevenue: 0,
          totalDiscountedRevenue: 0,
          totalOrders: 0
        });
      }
      
      // Update with actual data
      for (const result of results) {
        revenueMap.set(result.month, result);
      }
      
      // Convert map back to array and sort
      return Array.from(revenueMap.values())
        .sort((a, b) => b.month - a.month);
    }
    
    // If no year specified and no results, return current year with zero values
    if (results.length === 0) {
      const currentYear = new Date().getFullYear();
      const emptyData: MonthlyRevenueDTO[] = [];
      
      for (let i = 1; i <= 12; i++) {
        emptyData.push({
          month: i,
          year: currentYear,
          totalRevenue: 0,
          totalDiscountedRevenue: 0,
          totalOrders: 0
        });
      }
      
      return emptyData.sort((a, b) => b.month - a.month);
    }
    
    return results;
  }

  /**
   * Calculate revenue by product category
   * @param month Optional month to filter results
   * @param year Optional year to filter results
   * @returns Array of category revenue data
   */  async calculateCategoryRevenue(month?: number, year?: number): Promise<CategoryRevenueDTO[]> {
    let matchStage: any = { "order.status": OrderStatus.DELIVERED };
    
    if (month && year) {
      // Add month and year filter
      matchStage = {
        ...matchStage,
        "order.orderDate": {
          $gte: new Date(`${year}-${month.toString().padStart(2, '0')}-01`).toISOString(),
          $lte: new Date(`${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`).toISOString()
        }
      };
    } else if (year) {
      // Add only year filter
      matchStage = {
        ...matchStage,
        "order.orderDate": {
          $gte: new Date(`${year}-01-01`).toISOString(),
          $lte: new Date(`${year}-12-31`).toISOString()
        }
      };
    }
    
    // Get categories first to make sure we return all categories even if no revenue
    const categories = await OrderItem.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name"
        }
      },
      {
        $project: {
          _id: 0,
          categoryName: "$_id"
        }
      }
    ]);
    
    const results = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      { $match: matchStage },
      {
        $group: {
          _id: "$category.name",
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$product.isSale", true] },
                { $multiply: ["$quantity", "$product.salePrice"] },
                { $multiply: ["$quantity", "$price"] }
              ]
            }
          },
          totalDiscountedRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$product.isSale", true] },
                { $multiply: ["$quantity", "$product.salePrice"] },
                { $multiply: ["$quantity", "$price"] }
              ]
            }
          },
          orderIds: { $addToSet: "$order._id" }
        }
      },
      {
        $project: {
          _id: 0,
          categoryName: "$_id",
          totalRevenue: 1,
          totalDiscountedRevenue: 1,
          totalOrders: { $size: "$orderIds" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    // Create map of results by category name
    const categoryMap = new Map<string, CategoryRevenueDTO>();
    
    // Initialize map with all categories with zero values
    for (const category of categories) {
      categoryMap.set(category.categoryName, {
        categoryName: category.categoryName,
        totalRevenue: 0,
        totalDiscountedRevenue: 0,
        totalOrders: 0
      });
    }
    
    // Update with actual data
    for (const result of results) {
      categoryMap.set(result.categoryName, result);
    }
    
    // If no results at all, return empty array with at least one "No Category" entry
    if (categoryMap.size === 0) {
      return [{
        categoryName: "No Category",
        totalRevenue: 0,
        totalDiscountedRevenue: 0,
        totalOrders: 0
      }];
    }
    
    // Convert map back to array and sort by revenue
    return Array.from(categoryMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
  /**
   * Get order statistics by status
   * @returns Array of status counts
   */
  async getOrderStatusStatistics(): Promise<OrderStatusDTO[]> {
    const results = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          orderCount: { $count: {} }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          orderCount: 1
        }
      }
    ]);
    
    // Ensure all order statuses are included with at least zero count
    const statusMap = new Map<OrderStatus, OrderStatusDTO>();
    
    // Initialize all possible order statuses with zero
    Object.values(OrderStatus).forEach(status => {
      statusMap.set(status as OrderStatus, {
        status: status as OrderStatus,
        orderCount: 0
      });
    });
    
    // Update with actual data
    for (const result of results) {
      statusMap.set(result.status, result);
    }
    
    // Convert map back to array
    return Array.from(statusMap.values());
  }
}

// Export as a singleton
export default new ReportService();
