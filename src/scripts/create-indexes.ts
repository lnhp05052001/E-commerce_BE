import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model';
import Category from '../models/category.model';
import Brand from '../models/brand.model';

dotenv.config();

const createIndexIfNotExists = async (collection: any, indexSpec: any, options: any = {}) => {
  try {
    await collection.createIndex(indexSpec, options);
    console.log(`✅ Created index: ${JSON.stringify(indexSpec)}`);
  } catch (error: any) {
    if (error.code === 86) { // Index already exists
      console.log(`ℹ️  Index already exists: ${JSON.stringify(indexSpec)}`);
    } else {
      console.error(`❌ Error creating index ${JSON.stringify(indexSpec)}:`, error.message);
    }
  }
};

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Đã kết nối MongoDB');

    console.log('🚀 Bắt đầu tạo indexes cho Product collection...');
    
    // Tạo indexes cho Product collection
    await createIndexIfNotExists(Product.collection, { isActive: 1 });
    await createIndexIfNotExists(Product.collection, { createdAt: -1 });
    await createIndexIfNotExists(Product.collection, { price: 1 });
    await createIndexIfNotExists(Product.collection, { salePrice: 1 });
    await createIndexIfNotExists(Product.collection, { isSale: 1 });
    await createIndexIfNotExists(Product.collection, { category: 1 });
    await createIndexIfNotExists(Product.collection, { brand: 1 });
    await createIndexIfNotExists(Product.collection, { gender: 1 });
    await createIndexIfNotExists(Product.collection, { sizes: 1 });
    await createIndexIfNotExists(Product.collection, { colors: 1 });
    
    // Compound indexes cho các truy vấn phổ biến
    await createIndexIfNotExists(Product.collection, { 
      isActive: 1, 
      createdAt: -1 
    });
    await createIndexIfNotExists(Product.collection, { 
      isActive: 1, 
      category: 1 
    });
    await createIndexIfNotExists(Product.collection, { 
      isActive: 1, 
      brand: 1 
    });
    await createIndexIfNotExists(Product.collection, { 
      isActive: 1, 
      gender: 1 
    });
    await createIndexIfNotExists(Product.collection, { 
      isActive: 1, 
      isSale: 1, 
      salePrice: 1 
    });
    
    // Text index cho tìm kiếm
    await createIndexIfNotExists(Product.collection, { 
      name: 'text', 
      description: 'text' 
    });

    console.log('🚀 Bắt đầu tạo indexes cho Category collection...');
    
    // Indexes cho Category collection
    await createIndexIfNotExists(Category.collection, { isActive: 1 });
    await createIndexIfNotExists(Category.collection, { name: 1 });

    console.log('🚀 Bắt đầu tạo indexes cho Brand collection...');
    
    // Indexes cho Brand collection  
    await createIndexIfNotExists(Brand.collection, { isActive: 1 });
    await createIndexIfNotExists(Brand.collection, { name: 1 });

    console.log('🎉 Hoàn thành tạo indexes');
    
    // Hiển thị danh sách indexes đã tạo
    const productIndexes = await Product.collection.indexes();
    console.log('📋 Product indexes:', productIndexes.map(idx => idx.name));
    
    const categoryIndexes = await Category.collection.indexes();
    console.log('📋 Category indexes:', categoryIndexes.map(idx => idx.name));
    
    const brandIndexes = await Brand.collection.indexes();
    console.log('📋 Brand indexes:', brandIndexes.map(idx => idx.name));

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo indexes:', error);
    process.exit(1);
  }
};

createIndexes();
