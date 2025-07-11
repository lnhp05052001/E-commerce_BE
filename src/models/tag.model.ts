import mongoose, { Document, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, "Tên tag là bắt buộc"],
      unique: true,
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

// Tự động tạo slug từ tên tag
TagSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    const { generateTagSlug } = require('../utils/slug.util');
    this.slug = generateTagSlug(this.name);
  }
  next();
});

export default mongoose.model<ITag>("Tag", TagSchema);
