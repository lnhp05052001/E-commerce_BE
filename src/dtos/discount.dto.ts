import { Types } from 'mongoose';
import { DiscountType } from '../models/discount.model';

export interface DiscountDTO {
  name: string;
  discountCode: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  maxUsage: number;
  applicableProductId?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface DiscountRequest {
  code: string;
}
