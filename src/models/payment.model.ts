import mongoose, { Document, Schema } from 'mongoose';
import { IOrder } from './order.model';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY'
}

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId | IOrder;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDetails?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Số tiền thanh toán là bắt buộc'],
      min: [0, 'Số tiền thanh toán không thể âm'],
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, 'Phương thức thanh toán là bắt buộc'],
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    transactionId: {
      type: String,
    },
    paymentDetails: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
