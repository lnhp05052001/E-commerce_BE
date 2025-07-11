import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, 'Tên là bắt buộc'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Nội dung tin nhắn là bắt buộc'],
    },
    status: {
      type: String,
      enum: ['NEW', 'READ', 'RESPONDED'],
      default: 'NEW',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IContact>('Contact', ContactSchema);
