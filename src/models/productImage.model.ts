import mongoose, { Document, Schema } from 'mongoose';
import { Relation } from '../types/database';
import { IProduct } from './product.model';

export interface IProductImage extends Document {
  url: string;
  isFeatured: boolean;
  altText?: string;
  product: Relation<IProduct>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: {
      type: String,
      required: [true, 'URL hình ảnh là bắt buộc'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    altText: {
      type: String,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProductImage>('ProductImage', ProductImageSchema);
