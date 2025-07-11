/**
 * Interfaces cho Request và Response của User API
 */

// Interface cho response API
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T;
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

// Interface cho request đăng ký
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Interface cho request đăng nhập
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface cho response đăng nhập
export interface LoginResponse {
  user: Record<string, any>; // IUser (không bao gồm password)
  token: string;
}

// Interface cho cập nhật thông tin người dùng
export interface UserUpdateRequest {
  username?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
}

// Interface cho đổi mật khẩu
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Interface cho OTP
export interface OtpRequest {
  email: string;
  otp?: string;
}

// Interface cho thay đổi role
export interface ChangeRoleRequest {
  role: 'USER' | 'ADMIN';
}
