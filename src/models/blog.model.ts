import mongoose, { Document, Schema } from 'mongoose';
import { Relation, RelationList } from '../types/database';
import { IBlogCategory } from './blogCategory.model';
import { ITag } from './tag.model';
import { IUser } from './user.model';

export interface IBlog extends Document {
  title: string;
  content: string;
  image?: string;
  status: string;
  category: Relation<IBlogCategory>;
  author: Relation<IUser>;
  tags: RelationList<ITag>;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết là bắt buộc'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bài viết là bắt buộc'],
    },
    image: {
      type: String,
    },
    status: {
      type: String,
       default: 'DRAFT',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag',
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

// Tự động tạo slug từ tiêu đề bài viết
BlogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const { generateBlogSlug } = require('../utils/slug.util');
    this.slug = generateBlogSlug(this.title);
  }
  next();
});

export default mongoose.model<IBlog>('Blog', BlogSchema);
