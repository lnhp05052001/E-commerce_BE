import mongoose, { Document, Schema } from 'mongoose';
import { Relation } from '../types/database';
import { IUser } from './user.model';

export interface IAddress extends Document {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  user: Relation<IUser>;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    firstName: {
      type: String,
      required: [true, 'Tên là bắt buộc'],
    },
    lastName: {
      type: String,
      required: [true, 'Họ là bắt buộc'],
    },
    streetAddress: {
      type: String,
      required: [true, 'Địa chỉ đường phố là bắt buộc'],
    },
    city: {
      type: String,
      required: [true, 'Thành phố là bắt buộc'],
    },
    state: {
      type: String,
      required: [true, 'Tỉnh/Thành phố là bắt buộc'],
    },
    zipCode: {
      type: String,
      required: [true, 'Mã bưu điện là bắt buộc'],
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAddress>('Address', AddressSchema);
