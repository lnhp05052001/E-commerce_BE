import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogCategory extends Document {
  name: string;
  description?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục blog là bắt buộc'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
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

// Tự động tạo slug từ tên danh mục blog
BlogCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const { generateCategorySlug } = require('../utils/slug.util');
    this.slug = generateCategorySlug(this.name);
  }
  next();
});

export default mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema);
