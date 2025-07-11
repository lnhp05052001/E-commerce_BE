import { OrderStatus } from '../models/order.model';

/**
 * Interface for order item in request
 */
export interface OrderItemRequest {
  product: number;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  selectedSize?: string;
  selectedColor?: string;
}
 
 

/**
 * Interface for Order request data
 */
export interface OrderRequest {
  username: string;
  paymentMethod: string;
  orderItems: OrderItemRequest[];
  discountAmount: number;
  finalAmount: number;
  totalAmount: number;
  address: string;
  discountCode: string;
}

/**
 * Interface for payment result in response
 */
export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

/**
 * Interface for order status update request
 */
export interface OrderStatusRequest {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

/**
 * Interface for pagination response
 */
export interface PaginationResponse {
  page: number;
  totalPages: number;
  totalItems: number;
}

export interface OrderItemDTO {
  product: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  selectedSize?: string;
  selectedColor?: string;
}
 

export interface OrderRequestDTO {
  username: string;
  paymentMethod: string;
  orderItems: OrderItemDTO[];
  discountAmount: number;
  finalAmount: number;
  totalAmount: number;
  address: string;
  discountCode: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface PaymentResultDTO {
  id: string;
  status: string;
  updateTime: string;
  emailAddress: string;
}
