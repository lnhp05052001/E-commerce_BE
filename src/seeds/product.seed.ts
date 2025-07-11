import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model';
import products from './products.json';

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Đã kết nối MongoDB');

    await Product.deleteMany({});
    console.log('🗑️ Đã xóa sản phẩm cũ');

    await Product.insertMany(products);
    console.log('🌱 Đã thêm sản phẩm mới thành công');

    process.exit();
  } catch (error) {
    console.error('❌ Lỗi seed:', error);
    process.exit(1);
  }
};

seedProducts();