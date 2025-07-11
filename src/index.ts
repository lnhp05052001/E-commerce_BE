import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/database';
import { setupSwagger } from './config/swagger';
import { errorHandler, notFound } from './middleware/error.middleware';
import './models/index'; // Import all models to ensure they're registered
import addressRoutes from './routes/address.routes';
import blogRoutes from './routes/blog.routes';
import blogCategoryRoutes from './routes/blogCategory.routes';
import blogTagRoutes from './routes/blogTag.routes';
import brandRoutes from './routes/brand.routes';
import cartRoutes from './routes/cart.routes';
import categoryRoutes from './routes/category.routes';
import contactRoutes from './routes/contact.routes';
import discountRoutes from './routes/discount.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import reportRoutes from './routes/report.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
 
// Cấu hình dotenv
dotenv.config();

// Kết nối database
connectDB();

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình CORS chi tiết
app.use(cors( ));

// Cấu hình Helmet với các ngoại lệ cần thiết
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:*", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:*"]
    }
  }
}));

app.use(morgan('dev')); // Thêm Morgan logger với format 'dev'

// Serve static files từ thư mục uploads với CORS headers
app.use('/api/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('API đang chạy...');
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blog-category', blogCategoryRoutes);
app.use('/api/blog-tags', blogTagRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
 
// Cấu hình Swagger
setupSwagger(app);

// Middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

// Khởi động server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy ở chế độ ${process.env.NODE_ENV} trên cổng ${PORT}`);
  console.log(`API Documentation có sẵn tại http://localhost:${PORT}/api-docs`);
});
