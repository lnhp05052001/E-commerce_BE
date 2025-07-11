import mongoose, { Document, Schema } from 'mongoose';
import { Relation, RelationList } from '../types/database';
import { IProduct } from './product.model';
import { IUser } from './user.model';

export interface ICartItem extends Document {
  product: Relation<IProduct>;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
  cart: Relation<ICart>;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Số lượng không thể nhỏ hơn 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Giá không thể âm'],
    },
    selectedSize: {
      type: String,
      trim: true,
    },
    selectedColor: {
      type: String,
      trim: true,
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export interface ICart extends Document {
  user: Relation<IUser>;
  items: RelationList<ICartItem>;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [{
      type: Schema.Types.ObjectId,
      ref: 'CartItem',
    }],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware để tính toán tổng giá giỏ hàng trước khi lưu
CartSchema.pre('save', async function (next) {
  try {
    // Nếu items có thay đổi, tính toán lại tổng giá
    if (this.isModified('items')) {
      const populatedCart = await this.populate('items');
      
      const total = populatedCart.items.reduce((acc, item: any) => {
        return acc + (item.price * item.quantity);
      }, 0);
      
      this.totalPrice = total;
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

export const CartItem = mongoose.model<ICartItem>('CartItem', CartItemSchema);
export const Cart = mongoose.model<ICart>('Cart', CartSchema);
export default mongoose.model<ICart>('Cart', CartSchema);
