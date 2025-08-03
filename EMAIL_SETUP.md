# Hướng dẫn cấu hình Email Service

## 1. Cấu hình Gmail SMTP (Khuyên dùng)

### Bước 1: Tạo App Password cho Gmail
1. Đăng nhập vào Gmail của bạn
2. Vào Google Account Settings: https://myaccount.google.com/
3. Chọn "Security" → "2-Step Verification" (bật nếu chưa có)
4. Sau khi bật 2-Step Verification, chọn "App passwords"
5. Chọn "Mail" và "Other (custom name)"
6. Nhập tên ứng dụng: "Fashion Factory Backend"
7. Copy app password được tạo ra (16 ký tự)

### Bước 2: Cập nhật file .env
Thay đổi các giá trị sau trong file `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM="Fashion Factory" <your-gmail@gmail.com>
```

## 2. Cấu hình Email Provider khác

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## 3. Test Email Service

Để test email service, bạn có thể:

1. Khởi động server: `npm run dev`
2. Sử dụng Postman hoặc curl để gọi API:

```bash
curl -X POST http://localhost:5000/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 4. Troubleshooting

### Lỗi thường gặp:

1. **Invalid login**: 
   - Kiểm tra EMAIL_USER và EMAIL_PASS
   - Đảm bảo đã bật 2-Step Verification (Gmail)
   - Sử dụng App Password thay vì mật khẩu thường

2. **Connection timeout**:
   - Kiểm tra EMAIL_HOST và EMAIL_PORT
   - Thử đổi EMAIL_SECURE từ false sang true hoặc ngược lại

3. **Email không được gửi**:
   - Kiểm tra spam folder
   - Kiểm tra logs trong console
   - Đảm bảo email recipient hợp lệ

## 5. Bảo mật

- Không bao giờ commit file .env vào git
- Sử dụng App Password thay vì mật khẩu chính
- Định kỳ thay đổi App Password
- Giới hạn rate limiting cho API forgot-password
