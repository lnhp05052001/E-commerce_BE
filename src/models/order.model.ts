import mongoose, { Document, Schema } from "mongoose";
import { Relation } from "../types/database";
import { IAddress } from "./address.model";
import { IProduct } from "./product.model";
import { IUser } from "./user.model";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface IOrderItem extends Document {
  _id: number; // Long in Java maps to number in TypeScript
  product: Relation<IProduct>; // ManyToOne relationship with Product
  quantity: number;
  price: number; // BigDecimal maps to number in TypeScript
  name: string;
  image?: string; // Optional
  selectedSize?: string;
  selectedColor?: string;
}

export interface IOrder extends Document {
  _id: number; // Long in Java maps to number in TypeScript
  orderId: string; // UUID as string
  user: Relation<IUser>;
  address: Relation<IAddress>; // OneToOne relationship with Address
  paymentMethod: string;
  status: OrderStatus; // Enum mapping from OrderStatus
  totalAmount: number; // BigDecimal maps to number in TypeScript
  discountAmount: number; // BigDecimal maps to number in TypeScript
  finalAmount: number; // BigDecimal maps to number in TypeScript
  orderDate: string; // LocalDateTime maps to string in JSON
  orderItems: Relation<IOrderItem>[]; // OneToMany relationship with OrderItem
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    selectedSize: {
      type: String,
      trim: true,
    },
    selectedColor: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    orderDate: {
      type: String,
      default: new Date().toISOString(),
      required: true,
    },
    orderItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],
    orderId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order ID before saving
OrderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    // Format: ORD-YYYYMMDD-XXXX (XXXX is random number)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit number

    this.orderId = `ORD-${year}${month}${day}-${randomPart}`;
  }
  next();
});

export const OrderItem = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);
export default mongoose.model<IOrder>("Order", OrderSchema);
