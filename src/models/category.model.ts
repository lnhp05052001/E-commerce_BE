import { RelationList } from '@/types/database';
import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './product.model';

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  slug: string;
  products?: RelationList<IProduct> | null; // ✅ sửa lại ở đây
  createdAt: Date;
  updatedAt: Date;
}


const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Tự động tạo slug từ tên danh mục
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const { generateCategorySlug } = require('../utils/slug.util');
    this.slug = generateCategorySlug(this.name);
  }
  next();
});

export default mongoose.model<ICategory>('Category', CategorySchema);
