import { IAddress } from "@/models/address.model";
import { IBlog } from "@/models/blog.model";
import { IBrand } from "@/models/brand.model";
import { ICart, ICartItem } from "@/models/cart.model";
import { ICategory } from "@/models/category.model";
import { IDiscount } from "@/models/discount.model";
import { IOrder, IOrderItem } from "@/models/order.model";
import { IProduct } from "@/models/product.model";
import { IReview } from "@/models/review.model";
import { IUser } from "@/models/user.model";
import { Populated } from "./database";

export type IBrandPopulated = Populated<IBrand, "products">;

// Product đã populate nhiều trường
export type IProductPopulated = Populated<
  IProduct,
  "category" | "brand" | "reviews"
>;

export type ICategoryPopulated = Populated<ICategory, "products">;


export type IReviewPopulated = Populated<IReview, "user" | "product">;
export type ICartPopulated = Populated<ICart, "user" | "items">;
export type ICartItemPopulated = Populated<ICartItem, "product" | "cart">;
export type IUserPopulated = Populated<IUser, "addresses" | "reviews" | "cart">;
export type IAddressPopulated = Populated<IAddress, "user">;
export type IOrderItemPopulated = Populated<IOrderItem, 'product' >;

export type IOrderPopulated = Populated<IOrder, 'user' | 'orderItems' | 'address'>;
export type IDiscountPopulated = Populated<IDiscount, 'applicableProductId'>;
export type IBlogPopulated = Populated<IBlog, 'category' | 'author' | 'tags'>;

 