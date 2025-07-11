import mongoose from "mongoose";
import Cart from "../models/cart.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import {
  ICartPopulated,
  IOrderPopulated,
  IProductPopulated,
} from "../types/populate-helper";

/**
 * Populate các trường của sản phẩm
 * @param product - Tài liệu sản phẩm từ MongoDB
 * @returns Sản phẩm đã được populated
 */
export const populateProduct = async (
  product: mongoose.Document | null
): Promise<IProductPopulated | null> => {
  if (!product) return null;

  return (await Product.findById(product._id)
    .populate("category", "name slug")
    .populate("brand", "name logo slug")
    .populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "username avatar",
      },
    })) as unknown as IProductPopulated;
};

/**
 * Populate các trường của giỏ hàng
 * @param cart - Tài liệu giỏ hàng từ MongoDB
 * @returns Giỏ hàng đã được populated
 */
export const populateCart = async (
  cart: mongoose.Document | null
): Promise<ICartPopulated | null> => {
  if (!cart) return null;

  return (await Cart.findById(cart._id)
    .populate("user", "username email avatar")
    .populate({
      path: "items",
      populate: {
        path: "product",
        select: "name price salePrice isSale stock productImages slug",
      },
    })) as unknown as ICartPopulated;
};

/**
 * Populate các trường của đơn hàng
 * @param order - Tài liệu đơn hàng từ MongoDB
 * @param populateProductDetails - Có nên populate chi tiết sản phẩm không
 * @returns Đơn hàng đã được populated
 */
export const populateOrder = async (
  order: mongoose.Document | null,
  populateProductDetails: boolean = false
): Promise<IOrderPopulated | null> => {
  if (!order) return null;

  if (populateProductDetails) {
    return (await Order.findById(order._id)
      .populate("user", "username email avatar")
      .populate("address")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: [
            { path: 'category', select: 'name slug' },
            { path: 'brand', select: 'name logo slug' }
          ]
        },
      })) as unknown as IOrderPopulated;
  } else {
    return (await Order.findById(order._id)
      .populate("user", "username email avatar")
      .populate("address")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
        },
      })) as unknown as IOrderPopulated;
  }
};
