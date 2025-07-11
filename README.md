# Backend NodeJS TypeScript cho Ứng dụng Bán hàng

Backend API xây dựng bằng Node.js, Express, TypeScript và MongoDB cho ứng dụng bán hàng.

## Các tính năng

- **Xác thực JWT**: Đăng nhập, đăng ký người dùng
- **Phân quyền**: Admin và User thông thường
- **CRUD API**: Users, Products, Categories, Orders, Addresses
- **Quản lý địa chỉ**: Tạo, cập nhật, xóa và đặt địa chỉ mặc định
- **Xử lý đơn hàng**: Thanh toán, giao hàng
- **TypeScript**: Typed codebase cho phát triển an toàn hơn
- **Swagger API docs**: Tài liệu API tự động
- **Testing**: Unit và Integration testing với Jest

## Công nghệ sử dụng

- Node.js
- Express
- TypeScript
- MongoDB & Mongoose
- JWT Authentication
- Jest & Supertest (Testing)
- Middleware xử lý lỗi
- Tích hợp bảo mật (helmet)

## API Endpoints

### Address API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/address` | Tạo địa chỉ mới |
| GET | `/api/address` | Lấy tất cả địa chỉ của người dùng đăng nhập |
| GET | `/api/address/default` | Lấy địa chỉ mặc định của người dùng |
| GET | `/api/address/:id` | Lấy thông tin địa chỉ theo ID |
| PUT | `/api/address/:id` | Cập nhật thông tin địa chỉ |
| PUT | `/api/address/:id/default` | Đặt địa chỉ làm mặc định |
| DELETE | `/api/address/:id` | Xóa địa chỉ |

## Cài đặt

1. Clone repository
```
git clone <repository-url>
cd banhang_be
```

2. Cài đặt các dependencies
```
npm install
```

3. Tạo file .env trong thư mục gốc và thêm các biến môi trường
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/banhang
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Chạy ứng dụng
```
# Chế độ development
npm run dev

# Build và chạy production
npm run build
npm start
```

## API Endpoints

### User Routes
- `POST /api/users` - Đăng ký người dùng mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/profile` - Lấy thông tin người dùng (Auth required)
- `PUT /api/users/profile` - Cập nhật thông tin người dùng (Auth required)
- `GET /api/users` - Lấy tất cả người dùng (Admin only)
- `DELETE /api/users/:id` - Xóa người dùng (Admin only)

### Category Routes
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/:id` - Lấy danh mục theo ID
- `POST /api/categories` - Tạo danh mục mới (Admin only)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin only)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin only)

### Product Routes
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `POST /api/products` - Tạo sản phẩm mới (Admin only)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin only)

### Order Routes
- `POST /api/orders` - Tạo đơn hàng mới (Auth required)
- `GET /api/orders/myorders` - Lấy đơn hàng của người dùng (Auth required)
- `GET /api/orders/:id` - Lấy đơn hàng theo ID (Auth required)
- `PUT /api/orders/:id/pay` - Cập nhật trạng thái thanh toán (Auth required)
- `PUT /api/orders/:id/deliver` - Cập nhật trạng thái giao hàng (Admin only)
- `GET /api/orders` - Lấy tất cả đơn hàng (Admin only)

## Cấu trúc thư mục

```
banhang_be/
├── src/
│   ├── config/         # Cấu hình database và các cài đặt
│   ├── controllers/    # Xử lý logic của routes
│   ├── middleware/     # Middleware xác thực và xử lý lỗi
│   ├── models/         # Mongoose models
│   ├── routes/         # Định nghĩa routes
│   ├── __tests__/      # Tests (unit, integration)
│   ├── utils/          # Các tiện ích
│   └── index.ts        # Điểm khởi đầu của ứng dụng
├── .env                # Biến môi trường
├── jest.config.js      # Cấu hình Jest
├── tsconfig.json       # Cấu hình TypeScript
└── package.json        # Dependencies và scripts
```

## Kiểm thử (Testing)

Dự án sử dụng Jest để chạy unit test và integration test. MongoDB Memory Server được sử dụng để tạo database tạm thời cho việc test.

### Cấu trúc thư mục test

```
src/
  __tests__/
    integration/       # Test API endpoints và chức năng tích hợp
    unit/              # Test các function và component riêng lẻ
    utils/             # Các tiện ích cho việc test
```

### Chạy các test

```bash
# Chạy tất cả các test
npm test

# Chạy test với chế độ watch (tự động chạy lại khi có thay đổi)
npm run test:watch

# Chạy test và tạo báo cáo coverage
npm run test:coverage

# Chạy chỉ unit test
npm run test:unit

# Chạy chỉ integration test
npm run test:integration
```

### Các loại test

1. **Unit Tests**: Test các function, utilities, models riêng lẻ
   - Models: Kiểm tra validation, methods, virtuals
   - Utils: Kiểm tra logic của các hàm tiện ích
   - Middleware: Kiểm tra logic xử lý của middleware

2. **Integration Tests**: Test các API endpoints và luồng hoạt động
   - Controllers: Kiểm tra các API endpoints
   - Authentication: Kiểm tra đăng nhập, đăng ký, phân quyền
   - Business Logic: Kiểm tra các luồng nghiệp vụ phức tạp

3. **Coverage Report**: Báo cáo độ phủ của test
   - Chạy `npm run test:coverage` để tạo báo cáo
   - Kết quả được lưu trong thư mục `coverage/`
