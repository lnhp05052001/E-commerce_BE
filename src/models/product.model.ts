import mongoose, { Document, Schema } from 'mongoose';
import { Relation, RelationList } from '../types/database';
import { IBrand } from './brand.model';
import { ICategory } from './category.model';
import { IReview } from './review.model';
 
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  isSale: boolean;
  stock: number;
  // Clothing specific attributes
  sizes?: string[]; // XS, S, M, L, XL, XXL, etc.
  colors?: string[]; // Available colors
  material?: string; // Cotton, Polyester, Denim, etc.
  gender?: string; // Men, Women, Unisex, Children
  style?: string; // Casual, Formal, Sports, etc.
  season?: string; // Summer, Winter, All-season, etc.
  // Remove ingredients and productUsage which are not relevant for clothing
  category: Relation<ICategory>;
  brand?: Relation<IBrand>;
  productImages?: string[]; // Array of image URLs
  reviews?: RelationList<IReview>;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả sản phẩm là bắt buộc'],
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá không thể âm'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Giá khuyến mãi không thể âm'],
      default: 0,
    },
    isSale: {
      type: Boolean,
      default: false,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    material: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex', 'Children'],
    },
    style: {
      type: String,
    },
    season: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Sản phẩm phải thuộc một danh mục'],
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    stock: {
      type: Number,
      required: [true, 'Số lượng tồn kho là bắt buộc'],
      min: [0, 'Số lượng tồn kho không thể âm'],
      default: 0,
    },
    productImages: {
      type: [String],
      default: [],
    },
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
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

// Tự động tạo slug từ tên sản phẩm
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const { generateProductSlug } = require('../utils/slug.util');
    this.slug = generateProductSlug(this.name);
  }
  next();
});

export default mongoose.model<IProduct>('Product', ProductSchema);
