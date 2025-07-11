import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';
import { Relation, RelationList } from '../types/database';
import { IAddress } from './address.model';
import { ICart } from './cart.model';
import { IReview } from './review.model';
 
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isLocked: boolean;
  bio?: string;
  phone?: string;
  otp?: string;
  role: string;
  addresses: RelationList<IAddress>;
  reviews: RelationList<IReview>;
  cart?: Relation<ICart>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username là bắt buộc'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: 8,
      select: false,
    },
    avatar: {
      type: String,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
    },
    phone: {
      type: String,
    },
    otp: {
      type: String,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    addresses: [{
      type: Schema.Types.ObjectId,
      ref: 'Address'
    }],
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }],
    cart: {
      type: Schema.Types.ObjectId,
      ref: 'Cart'
    },
  },
  {
    timestamps: true,
  }
);

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Phương thức so sánh mật khẩu
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
