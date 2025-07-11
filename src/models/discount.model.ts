import { Relation } from '@/types/database';
import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './product.model';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export interface IDiscount extends Document {
  name: string;
  discountCode: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  maxUsage: number;
  usageCount: number;
  applicableProductId?: Relation<IProduct>;  // dùng Relation thay vì ObjectId thuần
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    name: {
      type: String,
      required: [true, 'Tên mã giảm giá là bắt buộc'],
      trim: true,
    },
    discountCode: {
      type: String,
      required: [true, 'Mã giảm giá là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: [true, 'Loại giảm giá là bắt buộc'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Giá trị giảm giá là bắt buộc'],
      min: [0, 'Giá trị giảm giá không thể âm'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Giá trị đơn hàng tối thiểu không thể âm'],
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Số tiền giảm giá tối đa không thể âm'],
    },
    maxUsage: {
      type: Number,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    applicableProductId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware để kiểm tra mã giảm giá có hợp lệ không
DiscountSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.maxUsage === 0 || this.usageCount < this.maxUsage)
  );
};

export default mongoose.model<IDiscount>('Discount', DiscountSchema);
