import { Relation } from '@/types/database';
import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './product.model';

export interface IBrand extends Document {
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  products?: Relation<IProduct>  | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}


const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, 'Tên thương hiệu là bắt buộc'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tự động tạo slug từ tên thương hiệu
BrandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const { generateBrandSlug } = require('../utils/slug.util');
    this.slug = generateBrandSlug(this.name);
  }
  next();
});

export default mongoose.model<IBrand>('Brand', BrandSchema);
