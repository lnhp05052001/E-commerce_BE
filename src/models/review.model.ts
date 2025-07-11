import mongoose, { Document, Schema } from 'mongoose';
import { Relation } from '../types/database';
import { IProduct } from './product.model';
import { IUser } from './user.model';

export interface IReview extends Document {
  rating: number;
  comment?: string;
  user: Relation<IUser>;
  product: Relation<IProduct>;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    rating: {
      type: Number,
      required: [true, 'Đánh giá là bắt buộc'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
